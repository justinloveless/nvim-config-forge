interface NvimListenerConfig {
  port: number;
  token?: string;
}

interface NvimSaveResponse {
  success: boolean;
  message?: string;
  path?: string;
}

export const detectNvimListener = async (config: NvimListenerConfig): Promise<boolean> => {
  try {
    const response = await fetch(`http://127.0.0.1:${config.port}/ping`, {
      method: 'GET',
      headers: config.token ? { 'Authorization': `Bearer ${config.token}` } : {},
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const saveToNvim = async (
  content: string, 
  filename: string, 
  config: NvimListenerConfig
): Promise<NvimSaveResponse> => {
  try {
    const formData = new FormData();
    const file = new Blob([content], { type: 'text/plain' });
    formData.append('file', file, filename);

    const response = await fetch(`http://127.0.0.1:${config.port}/save`, {
      method: 'POST',
      headers: {
        ...(config.token ? { 'Authorization': `Bearer ${config.token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      path: data.path,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};

export const generateNvimListenerCode = (port: number = 45831, token?: string): string => {
  return `
-- Neovim HTTP listener for seamless config updates (with multipart form data support)
local function setup_config_listener()
  local uv = vim.loop
  local port = ${port}
  ${token ? `local auth_token = "${token}"` : 'local auth_token = nil'}

  local function respond(client, status, headers, body)
    headers = headers or {}
    body = body or ""
    headers["Content-Length"] = tostring(#body)
    headers["Access-Control-Allow-Origin"] = "*"
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    headers["Connection"] = "close"

    local header_str = "HTTP/1.1 " .. status .. "\\r\\n"
    for k, v in pairs(headers) do
      header_str = header_str .. k .. ": " .. v .. "\\r\\n"
    end
    header_str = header_str .. "\\r\\n"

    client:write(header_str .. body)
    client:close()
  end

  local function parse_headers(header_str)
    local headers = {}
    for line in header_str:gmatch("[^\\r\\n]+") do
      local key, value = line:match("([^:]+):%s*(.+)")
      if key and value then
        headers[key:lower()] = value
      end
    end
    return headers
  end

  local function parse_multipart(body, boundary)
    local parts = {}
    local boundary_pattern = "--" .. boundary
    
    -- Find all boundary positions
    local boundary_positions = {}
    local pos = 1
    while true do
      local found = body:find(boundary_pattern, pos, true)
      if not found then break end
      table.insert(boundary_positions, found)
      pos = found + 1
    end
    
    -- Process each part between boundaries
    for i = 1, #boundary_positions - 1 do
      local start_pos = boundary_positions[i] + #boundary_pattern
      local end_pos = boundary_positions[i + 1] - 1
      local section = body:sub(start_pos, end_pos)
      
      -- Skip if empty or just whitespace
      if section:match("^%s*$") then
        goto continue
      end
      
      -- Remove leading CRLF
      if section:sub(1, 2) == "\\r\\n" then
        section = section:sub(3)
      end
      
      -- Find headers and content separator
      local header_end = section:find("\\r\\n\\r\\n", 1, true)
      if not header_end then
        goto continue
      end
      
      local headers_str = section:sub(1, header_end - 1)
      local content = section:sub(header_end + 4)
      
      -- Remove trailing CRLF
      if content:sub(-2) == "\\r\\n" then
        content = content:sub(1, -3)
      end
      
      -- Parse Content-Disposition header
      local name = headers_str:match('name="([^"]*)"')
      local filename = headers_str:match('filename="([^"]*)"')
      
      if name then
        parts[name] = {
          filename = filename,
          content = content,
          headers = headers_str
        }
      end
      
      ::continue::
    end
    
    return parts
  end

  local server = uv.new_tcp()
  server:bind("127.0.0.1", port)

  server:listen(128, function(err)
    if err then
      vim.notify("Failed to start config listener: " .. err, vim.log.levels.ERROR)
      return
    end

    local client = uv.new_tcp()
    server:accept(client)

    local buffer = ""
    client:read_start(function(read_err, chunk)
      if read_err then
        client:close()
        return
      end
      if not chunk then
        return
      end

      buffer = buffer .. chunk

      -- Ensure we have full headers first
      local header_end = buffer:find("\\r\\n\\r\\n", 1, true)
      if not header_end then
        return
      end

      local request_line = buffer:match("^(.-)\\r\\n") or ""
      local method, path = request_line:match("(%S+)%s+(%S+)")

      -- Extract headers block
      local first_crlf = buffer:find("\\r\\n", 1, true)
      local headers_str = ""
      if first_crlf then
        headers_str = buffer:sub(first_crlf + 2, header_end - 1)
      end
      local headers = parse_headers(headers_str)
      local content_length = tonumber(headers["content-length"] or "0") or 0

      -- Compute body boundaries
      local body_start = header_end + 4
      local available = #buffer - body_start + 1

      -- For GET/OPTIONS or when we have the full body
      if (method == "GET" or method == "OPTIONS") or content_length == 0 or available >= content_length then
        local body = ""
        if content_length > 0 and available >= content_length then
          body = buffer:sub(body_start, body_start + content_length - 1)
        end

        -- Handle CORS preflight
        if method == "OPTIONS" then
          respond(client, "200 OK", { ["Content-Type"] = "text/plain" }, "OK")
          return
        end

        -- Check authentication if token is set
        if auth_token then
          local auth_header = headers["authorization"]
          if not auth_header or auth_header ~= "Bearer " .. auth_token then
            respond(client, "401 Unauthorized", { ["Content-Type"] = "application/json" },
                    '{"error": "Invalid or missing token"}')
            return
          end
        end

        if method == "GET" and path == "/ping" then
          respond(client, "200 OK", { ["Content-Type"] = "application/json" },
                  '{"status": "ok", "message": "Neovim listener active"}')
        elseif method == "POST" and path == "/save" then
          local content_type = headers["content-type"] or ""
          local boundary = content_type:match("boundary=([^;%s]+)")
          
          if not boundary then
            respond(client, "400 Bad Request", { ["Content-Type"] = "application/json" },
                    '{"error": "Missing multipart boundary"}')
            return
          end
          
          local parts = parse_multipart(body, boundary)
          local file_part = parts["file"]
          
          if not file_part or not file_part.content or file_part.content == "" then
            respond(client, "400 Bad Request", { ["Content-Type"] = "application/json" },
                    '{"error": "Missing or empty file in multipart data"}')
            return
          end

          local config_dir = vim.fn.stdpath("config")
          local file_path = config_dir .. "/" .. file_part.filename

          local file = io.open(file_path, "w")
          if file then
            file:write(file_part.content)
            file:close()

            if file_part.filename == "init.lua" then
              vim.schedule(function()
                vim.notify("Config updated from web interface!", vim.log.levels.INFO)
                vim.cmd("source " .. file_path)
              end)
            end

            respond(client, "200 OK", { ["Content-Type"] = "application/json" },
                    '{"success": true, "message": "File saved successfully", "path": "' .. file_path .. '"}')
          else
            respond(client, "500 Internal Server Error", { ["Content-Type"] = "application/json" },
                    '{"error": "Failed to write file"}')
          end
        else
          respond(client, "404 Not Found", { ["Content-Type"] = "application/json" }, '{"error": "Not found"}')
        end
      else
        -- Not enough body data yet; keep reading
        return
      end
    end)
  end)

  vim.notify("Config listener started on port " .. port, vim.log.levels.INFO)

  -- Store server handle globally for cleanup
  _G.config_listener_server = server
end

-- Auto-start the listener
setup_config_listener()
`;
};