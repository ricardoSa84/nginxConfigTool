/* global module */
var db = require('./models/connectDB.js'),
    User = require('./models/user'),
    Ext = require('./models/ext.js'),
    OptionSelect = require('./models/optionselect.js'),
    OptionInfo = require('./models/OptionSelectInfo.js'),
    ini = require('ini'),
    fs = require('fs'),
    md5 = require('md5'),
    btoa = require('btoa');

User = new User();
Ext = new Ext();
OptionSelect = new OptionSelect();
OptionInfo = new OptionInfo();

module.exports.configDB = function() {
    var self = this;
    User.InsertUser({
        email: "admin@admin.pt", //self.config.user,
        pass: md5(btoa("admin" /*self.config.pass*/ ))
    }, null, null);
    self.InsertAllExt(null, null);
    self.InsertAllOptionSelect(null, null);
    self.InsertAllOptionSelectInfo(null, null);
};

module.exports.loginUser = function(req, res, next) {
    var params = { email: req.body.email, pass: req.body.pass };
    User.loginUser(params, res, next);
};

module.exports.insertUser = function(req, res, next) {
    User.InsertUser({
        email: "admin@admin.pt",
        pass: req.body.pass
    }, res, next);

};

module.exports.getAllExt = function(req, res) {
    Ext.getAllExt(req, res);
};

module.exports.InsertAllExt = function(req, res) {
    Ext.InsertExt({
        type: "ext",
        text: "Imagens",
        ext: ["jpg", "gif", "jpe?g", "png", "ico", "cur", "woff"]
    }, res);
    Ext.InsertExt({
        type: "ext",
        text: "Documentos",
        ext: ["pdf", "doc", "docx", "xls", "xlxs", "ppt", "pptx", "ttf", "otf", "eot", "svg"]
    }, res);
    Ext.InsertExt({
        type: "ext",
        text: "Conteudos HTML",
        ext: ["css", "js", "html", "xml", "htc"]
    }, res);
    Ext.InsertExt({
        type: "path",
        text: "path",
        ext: ["css", "js", "img", "Imagens", "images", "html"]
    }, res);
};

module.exports.getOptionsToPlace = function(req, res) {
    OptionSelect.getOptionsFromPlace({ context: new RegExp(req.params.place, "i") }, res);
};

module.exports.getOptionInfo = function(req, res) {
    OptionInfo.getOptionSelectedInfo(req.params.info, res);
};

module.exports.InsertAllOptionSelect = function(req, res) {
    var options = [
        { "directive": "absolute_redirect", "context": "http, server, location" },
        { "directive": "aio", "context": "http, server, location" },
        { "directive": "aio_write", "context": "http, server, location" },
        { "directive": "alias", "context": "location" },
        { "directive": "chunked_transfer_encoding", "context": "http, server, location" },
        { "directive": "client_body_buffer_size", "context": "http, server, location" },
        { "directive": "client_body_in_file_only", "context": "http, server, location" },
        { "directive": "client_body_in_single_buffer", "context": "http, server, location" },
        { "directive": "client_body_temp_path", "context": "http, server, location" },
        { "directive": "client_body_timeout", "context": "http, server, location" },
        { "directive": "client_header_buffer_size", "context": "http,server" },
        { "directive": "client_header_timeout", "context": "http,server" },
        { "directive": "client_max_body_size", "context": "http, server, location" },
        { "directive": "connection_pool_size", "context": "http,server" },
        { "directive": "default_type", "context": "http, server, location" },
        { "directive": "directio", "context": "http, server, location" },
        { "directive": "directio_alignment", "context": "http, server, location" },
        { "directive": "disable_symlinks", "context": "http, server, location" },
        { "directive": "error_page", "context": "http, server, location" },
        { "directive": "etag", "context": "http, server, location" },
        { "directive": "if_modified_since", "context": "http, server, location" },
        { "directive": "ignore_invalid_headers", "context": "http,server" },
        { "directive": "internal", "context": "location" },
        { "directive": "keepalive_disable", "context": "http, server, location" },
        { "directive": "keepalive_requests", "context": "http, server, location" },
        { "directive": "keepalive_timeout", "context": "http, server, location" },
        { "directive": "large_client_header_buffers", "context": "http,server" },
        { "directive": "limit_except", "context": "location" },
        { "directive": "limit_rate", "context": "http, server, location" },
        { "directive": "limit_rate_after", "context": "http, server, location" },
        { "directive": "lingering_close", "context": "http, server, location" },
        { "directive": "lingering_time", "context": "http, server, location" },
        { "directive": "lingering_timeout", "context": "http, server, location" },
        { "directive": "listen", "context": "server" },
        { "directive": "location", "context": "server,location" },
        { "directive": "log_not_found", "context": "http, server, location" },
        { "directive": "log_subrequest", "context": "http, server, location" },
        { "directive": "max_ranges", "context": "http, server, location" },
        { "directive": "merge_slashes", "context": "http, server" },
        { "directive": "msie_padding", "context": "http, server, location" },
        { "directive": "msie_refresh", "context": "http, server, location" },
        { "directive": "open_file_cache", "context": "http, server, location" },
        { "directive": "open_file_cache_errors", "context": "http, server, location" },
        { "directive": "open_file_cache_min_uses", "context": "http, server, location" },
        { "directive": "open_file_cache_valid", "context": "http, server, location" },
        { "directive": "output_buffers", "context": "http, server, location" },
        { "directive": "port_in_redirect", "context": "http, server, location" },
        { "directive": "postpone_output", "context": "http, server, location" },
        { "directive": "read_ahead", "context": "http, server, location" },
        { "directive": "recursive_error_pages", "context": "http, server, location" },
        { "directive": "request_pool_size", "context": "http, server" },
        { "directive": "reset_timedout_connection", "context": "http, server, location" },
        { "directive": "resolver", "context": "http, server, location" },
        { "directive": "resolver_timeout", "context": "http, server, location" },
        { "directive": "root", "context": "http, server, location" },
        { "directive": "satisfy", "context": "http, server, location" },
        { "directive": "send_lowat", "context": "http, server, location" },
        { "directive": "send_timeout", "context": "http, server, location" },
        { "directive": "sendfile", "context": "http, server, location" },
        { "directive": "sendfile_max_chunk", "context": "http, server, location" },
        { "directive": "server_name", "context": "http, server, location" },
        { "directive": "server_name_in_redirect", "context": "http, server, location" },
        { "directive": "server_tokens", "context": "http, server, location" },
        { "directive": "tcp_nodelay", "context": "http, server, location" },
        { "directive": "tcp_nopush", "context": "http, server, location" },
        { "directive": "try_files", "context": "server, location" },
        { "directive": "types", "context": "http, server, location" },
        { "directive": "types_hash_bucket_size", "context": "http, server, location" },
        { "directive": "types_hash_max_size", "context": "http, server, location" },
        { "directive": "underscores_in_headers", "context": "http, server" },
        { "directive": "server", "context": "upstream" },
        { "directive": "zone", "context": "upstream" },
        { "directive": "state", "context": "upstream" },
        { "directive": "hash", "context": "upstream" },
        { "directive": "ip_hash", "context": "upstream" },
        { "directive": "keepalive", "context": "upstream" },
        { "directive": "ntlm", "context": "upstream" },
        { "directive": "least_conn", "context": "upstream" },
        { "directive": "least_time", "context": "upstream" },
        { "directive": "queue", "context": "upstream" },
        { "directive": "sticky", "context": "upstream" },
        { "directive": "sticky_cookie_insert", "context": "upstream" },
        { "directive": "proxy_bind", "context": "http, server, location" },
        { "directive": "proxy_buffer_size", "context": "http, server, location" },
        { "directive": "proxy_buffering", "context": "http, server, location" },
        { "directive": "proxy_buffers", "context": "http, server, location" },
        { "directive": "proxy_busy_buffers_size", "context": "http, server, location" },
        { "directive": "proxy_cache", "context": "http, server, location" },
        { "directive": "proxy_cache_background_update", "context": "http, server, location" },
        { "directive": "proxy_cache_bypass", "context": "http, server, location" },
        { "directive": "proxy_cache_convert_head", "context": "http, server, location" },
        { "directive": "proxy_cache_key", "context": "http, server, location" },
        { "directive": "proxy_cache_lock", "context": "http, server, location" },
        { "directive": "proxy_cache_lock_age", "context": "http, server, location" },
        { "directive": "proxy_cache_lock", "context": "http, server, location" },
        { "directive": "proxy_cache_lock_timeout", "context": "http, server, location" },
        { "directive": "proxy_cache_max_range_offset", "context": "http, server, location" },
        { "directive": "proxy_cache_methods", "context": "http, server, location" },
        { "directive": "proxy_cache_min_uses", "context": "http, server, location" },
        { "directive": "proxy_cache_path", "context": "http" },
        { "directive": "proxy_cache_purge", "context": "http, server, location" },
        { "directive": "proxy_cache_revalidate", "context": "http, server, location" },
        { "directive": "proxy_cache_use_stale", "context": "http, server, location" },
        { "directive": "proxy_cache_valid", "context": "http, server, location" },
        { "directive": "proxy_connect_timeout", "context": "http, server, location" },
        { "directive": "proxy_cookie_domain", "context": "http, server, location" },
        { "directive": "proxy_cookie_path", "context": "http, server, location" },
        { "directive": "proxy_force_ranges", "context": "http, server, location" },
        { "directive": "proxy_headers_hash_bucket_size", "context": "http, server, location" },
        { "directive": "proxy_headers_hash_max_size", "context": "http, server, location" },
        { "directive": "proxy_hide_header", "context": "http, server, location" },
        { "directive": "proxy_http_version", "context": "http, server, location" },
        { "directive": "proxy_ignore_client_abort", "context": "http, server, location" },
        { "directive": "proxy_ignore_headers", "context": "http, server, location" },
        { "directive": "proxy_intercept_errors", "context": "http, server, location" },
        { "directive": "proxy_limit_rate", "context": "http, server, location" },
        { "directive": "proxy_max_temp_file_size", "context": "http, server, location" },
        { "directive": "proxy_method", "context": "http, server, location" },
        { "directive": "proxy_next_upstream", "context": "http, server, location" },
        { "directive": "proxy_next_upstream_timeout", "context": "http, server, location" },
        { "directive": "proxy_next_upstream_tries", "context": "http, server, location" },
        { "directive": "proxy_no_cache", "context": "http, server, location" },
        { "directive": "proxy_pass", "context": "http, server, location" },
        { "directive": "proxy_pass_header", "context": "http, server, location" },
        { "directive": "proxy_pass_request_body", "context": "http, server, location" },
        { "directive": "proxy_pass_request_headers", "context": "http, server, location" },
        { "directive": "proxy_read_timeout", "context": "http, server, location" },
        { "directive": "proxy_redirect", "context": "http, server, location" },
        { "directive": "proxy_request_buffering", "context": "http, server, location" },
        { "directive": "proxy_send_lowat", "context": "http, server, location" },
        { "directive": "proxy_send_timeout", "context": "http, server, location" },
        { "directive": "proxy_set_body", "context": "http, server, location" },
        { "directive": "proxy_set_header", "context": "http, server, location" },
        { "directive": "proxy_ssl_certificate", "context": "http, server, location" },
        { "directive": "proxy_ssl_certificate_key", "context": "http, server, location" },
        { "directive": "proxy_ssl_ciphers", "context": "http, server, location" },
        { "directive": "proxy_ssl_crl", "context": "http, server, location" },
        { "directive": "proxy_ssl_name", "context": "http, server, location" },
        { "directive": "proxy_ssl_password_file", "context": "http, server, location" },
        { "directive": "proxy_ssl_server_name", "context": "http, server, location" },
        { "directive": "proxy_ssl_session_reuse", "context": "http, server, location" },
        { "directive": "proxy_ssl_protocols", "context": "http, server, location" },
        { "directive": "proxy_ssl_trusted_certificate", "context": "http, server, location" },
        { "directive": "proxy_ssl_verify", "context": "http, server, location" },
        { "directive": "proxy_ssl_verify_depth", "context": "http, server, location" },
        { "directive": "proxy_store", "context": "http, server, location" },
        { "directive": "proxy_store_access", "context": "http, server, location" },
        { "directive": "proxy_temp_file_write_size", "context": "http, server, location" },
        { "directive": "proxy_temp_path", "context": "http, server, location" },
        { "directive": "rewrite", "context": "server, location, if" }
    ];
    // OptionSelect.InsertOptionSelect(options, res);
    for (var i = 0; i < options.length; i++) {
        OptionSelect.InsertOptionSelect(options[i], res);
    }
};

module.exports.InsertAllOptionSelectInfo = function(req, res) {
    var allOptionInfo = [{
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_core_module.html",
        "variables": ["$arg_name", "$args", "$binary_remote_addr", "$body_bytes_sent", "$bytes_sent", "$connection", "$connection_requests", "$content_length", "$content_type", "$cookie_name", "$document_root", "$document_uri", "$host", "$hostname", "$http_name", "$https", "$is_args", "$limit_rate", "$msec", "$nginx_version", "$pid", "$pipe", "$proxy_protocol_addr", "$proxy_protocol_port", "$query_string", "$realpath_root", "$remote_addr", "$remote_port", "$remote_user", "$request", "$request_body", "$request_body_file", "$request_completion", "$request_filename", "$request_id", "$request_length", "$request_method", "$request_time", "$request_uri", "$scheme", "$sent_http_name", "$server_addr", "$server_name", "$server_port", "$server_protocol", "$status", "$tcpinfo_rtt,$tcpinfo_rttvar,$tcpinfo_snd_cwnd,$tcpinfo_rcv_space", "$time_iso8601", "$time_local", "$uri"],
        "directives": [{ "directive": "absolute_redirect", "syntax": "absolute_redirect on | off", "default": "absolute_redirect on", "context": "http, server, location" },
            { "directive": "aio", "syntax": "aio on | off | threads[=pool]", "default": "aio off", "context": "http, server, location" },
            { "directive": "aio_write", "syntax": "aio_write on | off", "default": "aio_write off", "context": "http, server, location" },
            { "directive": "alias", "syntax": "alias path", "default": "---", "context": "location" },
            { "directive": "chunked_transfer_encoding", "syntax": "chunked_transfer_encoding on | off", "default": "chunked_transfer_encoding on", "context": "http, server, location" },
            { "directive": "client_body_buffer_size", "syntax": "client_body_buffer_size size", "default": "client_body_buffer_size 8k|16k", "context": "http, server, location" },
            { "directive": "client_body_in_file_only", "syntax": "client_body_in_file_only on | clean | off", "default": "client_body_in_file_only off", "context": "http, server, location" },
            { "directive": "client_body_in_single_buffer", "syntax": "client_body_in_single_buffer on | off", "default": "client_body_in_single_buffer off", "context": "http, server, location" },
            { "directive": "client_body_temp_path", "syntax": "client_body_temp_path path [level1 [level2 [level3]]]", "default": "client_body_temp_path client_body_temp", "context": "http, server, location" },
            { "directive": "client_body_timeout", "syntax": "client_body_timeout time", "default": "client_body_timeout60s", "context": "http, server, location" },
            { "directive": "client_header_buffer_size", "syntax": "client_header_buffer_size size", "default": "client_header_buffer_size 1k", "context": "http, server" },
            { "directive": "client_header_timeout", "syntax": "client_header_timeout time", "default": "client_header_timeout 60s", "context": "http, server" },
            { "directive": "client_max_body_size", "syntax": "client_max_body_size size", "default": "client_max_body_size 1m", "context": "http, server, location" },
            { "directive": "connection_pool_size", "syntax": "connection_pool_size size", "default": "connection_pool_size 256|512", "context": "http, server" },
            { "directive": "default_type", "syntax": "default_type mime-type", "default": "default_type text/plain", "context": "http, server, location" },
            { "directive": "directio", "syntax": "directio size | off", "default": "directio off", "context": "http, server, location" },
            { "directive": "directio_alignment", "syntax": "directio_alignment size", "default": "directio_alignment 512", "context": "http, server, location" },
            { "directive": "disable_symlinks", "syntax": "disable_symlinks off;disable_symlinks on | if_not_owner [from=part]", "default": "disable_symlinks off", "context": "http, server, location" },
            { "directive": "error_page", "syntax": "error_page code ... [=[response]] uri", "default": "---", "context": "http, server, location, if in location" },
            { "directive": "etag", "syntax": "etag on | off", "default": "etag on", "context": "http, server, location" },
            { "directive": "http", "syntax": "http { ... }", "default": "---", "context": "main" },
            { "directive": "if_modified_since", "syntax": "if_modified_since off | exact | before", "default": "if_modified_since exact", "context": "http, server, location" },
            { "directive": "ignore_invalid_headers", "syntax": "ignore_invalid_headers on | off", "default": "ignore_invalid_headers on", "context": "http, server" },
            { "directive": "internal", "syntax": "internal", "default": "---", "context": "location" },
            { "directive": "keepalive_disable", "syntax": "keepalive_disable none | browser ...", "default": "keepalive_disable msie6", "context": "http, server, location" },
            { "directive": "keepalive_requests", "syntax": "keepalive_requests number", "default": "keepalive_requests 100", "context": "http, server, location" },
            { "directive": "keepalive_timeout", "syntax": "keepalive_timeout timeout [header_timeout]", "default": "keepalive_timeout 75s", "context": "http, server, location" },
            { "directive": "large_client_header_buffers", "syntax": "large_client_header_buffers number size", "default": "large_client_header_buffers 4 8k", "context": "http, server" },
            { "directive": "limit_except", "syntax": "limit_except method ... { ... }", "default": "---", "context": "location" },
            { "directive": "limit_rate", "syntax": "limit_rate rate", "default": "limit_rate 0", "context": "http,server, location, if in location" },
            { "directive": "limit_rate_after", "syntax": "limit_rate_after size", "default": "limit_rate_after 0", "context": "http, server, location, if in location" },
            { "directive": "lingering_close", "syntax": "lingering_close off | on | always", "default": "lingering_close on", "context": "http, server, location" },
            { "directive": "lingering_time", "syntax": "lingering_time time", "default": "lingering_time 30s", "context": "http, server, location" },
            { "directive": "lingering_timeout", "syntax": "lingering_timeout time", "default": "lingering_timeout 5s", "context": "http, server, location" },
            { "directive": "listen", "syntax": "listen address[:port] [default_server] [ssl] [http2 | spdy] [proxy_protocol] [setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size]   [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];listen port [default_server] [ssl] [http2 | spdy] [proxy_protocol] [setfib=number] [fastopen=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];listen unix:path [default_server] [ssl]   [http2 | spdy] [proxy_protocol] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]]", "default": "listen *:80 | *:8000", "context": "server" },
            { "directive": "location", "syntax": "location [ = | ~ | ~* | ^~ ] uri { ... }location @name { ... }", "default": "---", "context": "server, location" },
            { "directive": "log_not_found", "syntax": "log_not_found on | off", "default": "log_not_found on", "context": "http, server, location" },
            { "directive": "log_subrequest", "syntax": "log_subrequest on | off", "default": "log_subrequest off", "context": "http, server, location" },
            { "directive": "max_ranges", "syntax": "max_ranges number", "default": "---", "context": "http, server, location" },
            { "directive": "merge_slashes", "syntax": "merge_slashes on | off", "default": "merge_slashes on", "context": "http, server" },
            { "directive": "msie_padding", "syntax": "msie_padding on | off", "default": "msie_padding on", "context": "http, server, location" },
            { "directive": "msie_refresh", "syntax": "msie_refresh on | off", "default": "msie_refresh off", "context": "http, server, location" },
            { "directive": "open_file_cache", "syntax": "open_file_cache off;open_file_cache max=N[inactive=time]", "default": "open_file_cache off", "context": "http, server, location" },
            { "directive": "open_file_cache_errors", "syntax": "open_file_cache_errors on | off", "default": "open_file_cache_errors off", "context": "http, server, location" },
            { "directive": "open_file_cache_min_uses", "syntax": "open_file_cache_min_uses number", "default": "open_file_cache_min_uses 1", "context": "http, server, location" },
            { "directive": "open_file_cache_valid", "syntax": "open_file_cache_valid time", "default": "open_file_cache_valid 60s", "context": "http, server, location" },
            { "directive": "output_buffers", "syntax": "output_buffers number size", "default": "output_buffers 2 32k", "context": "http, server, location" },
            { "directive": "port_in_redirect", "syntax": "port_in_redirect on | off", "default": "port_in_redirect on", "context": "http, server, location" },
            { "directive": "postpone_output", "syntax": "postpone_output size", "default": "postpone_output 1460", "context": "http, server, location" },
            { "directive": "read_ahead", "syntax": "read_ahead size", "default": "read_ahead 0", "context": "http, server, location" },
            { "directive": "recursive_error_pages", "syntax": "recursive_error_pages on | off", "default": "recursive_error_pages off", "context": "http, server, location" },
            { "directive": "request_pool_size", "syntax": "request_pool_size size", "default": "request_pool_size 4k", "context": "http, server" },
            { "directive": "reset_timedout_connection", "syntax": "reset_timedout_connection on | off", "default": "reset_timedout_connection off", "context": "http, server, location" },
            { "directive": "resolver", "syntax": "resolver address ... [valid=time] [ipv6=on|off]", "default": "---", "context": "http, server, location" },
            { "directive": "resolver_timeout", "syntax": "resolver_timeout time", "default": "resolver_timeout 30s", "context": "http, server, location" },
            { "directive": "root", "syntax": "root path", "default": "root html", "context": "http, server, location, if in location" },
            { "directive": "satisfy", "syntax": "satisfy all | any", "default": "satisfy all", "context": "http, server, location" },
            { "directive": "send_lowat", "syntax": "send_lowat size", "default": "send_lowat 0", "context": "http, server, location" },
            { "directive": "send_timeout", "syntax": "send_timeout time", "default": "send_timeout 60s", "context": "http, server, location" },
            { "directive": "sendfile", "syntax": "sendfile on | off", "default": "sendfile off", "context": "http, server, location, if in location" },
            { "directive": "sendfile_max_chunk", "syntax": "sendfile_max_chunk size", "default": "sendfile_max_chunk 0", "context": "http, server, location" },
            { "directive": "server", "syntax": "server { ... }", "default": "---", "context": "http" },
            { "directive": "server_name", "syntax": "server_name name ...", "default": "server_name &quot;&quot;", "context": "server" },
            { "directive": "server_name_in_redirect", "syntax": "server_name_in_redirect on | off", "default": "server_name_in_redirect off", "context": "http, server, location" },
            { "directive": "server_names_hash_bucket_size", "syntax": "server_names_hash_bucket_size size", "default": "server_names_hash_bucket_size 32|64|128", "context": "http" },
            { "directive": "server_names_hash_max_size", "syntax": "server_names_hash_max_size size", "default": "server_names_hash_max_size 512", "context": "http" },
            { "directive": "server_tokens", "syntax": "server_tokens on | off| build | string", "default": "server_tokens on", "context": "http, server, location" },
            { "directive": "tcp_nodelay", "syntax": "tcp_nodelay on | off", "default": "tcp_nodelay on", "context": "http, server, location" },
            { "directive": "tcp_nopush", "syntax": "tcp_nopush on | off", "default": "tcp_nopush off", "context": "http, server, location" },
            { "directive": "try_files", "syntax": "try_files file ... uri;try_files file ... =code", "default": "---", "context": "server, location" },
            { "directive": "types", "syntax": "types { ... }", "default": "types { text/html  html; image/gif  gif; image/jpeg jpg;}", "context": "http, server, location" },
            { "directive": "types_hash_bucket_size", "syntax": "types_hash_bucket_size size", "default": "types_hash_bucket_size 64", "context": "http, server, location" },
            { "directive": "types_hash_max_size", "syntax": "types_hash_max_size size", "default": "types_hash_max_size 1024", "context": "http, server, location" },
            { "directive": "underscores_in_headers", "syntax": "underscores_in_headers on | off", "default": "underscores_in_headers off", "context": "http, server" },
            { "directive": "variables_hash_bucket_size", "syntax": "variables_hash_bucket_size size", "default": "variables_hash_bucket_size 64", "context": "http" },
            { "directive": "variables_hash_max_size", "syntax": "variables_hash_max_size size", "default": "variables_hash_max_size 1024", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_access_module.html",
        "variables": [],
        "directives": [{ "directive": "allow", "syntax": "allow address | CIDR | unix: | all", "default": "---", "context": "http, server, location, limit_except" },
            { "directive": "deny", "syntax": "deny address | CIDR | unix: | all", "default": "---", "context": "http, server, location, limit_except" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_addition_module.html",
        "variables": [],
        "directives": [{ "directive": "add_before_body", "syntax": "add_before_body uri", "default": "---", "context": "http, server, location" },
            { "directive": "add_after_body", "syntax": "add_after_body uri", "default": "---", "context": "http, server, location" },
            { "directive": "addition_types", "syntax": "addition_types mime-type ...", "default": "addition_types text/html", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_auth_basic_module.html",
        "variables": [],
        "directives": [{ "directive": "auth_basic", "syntax": "auth_basic string | off", "default": "auth_basic off", "context": "http, server, location, limit_except" },
            { "directive": "auth_basic_user_file", "syntax": "auth_basic_user_file file", "default": "---", "context": "http, server, location, limit_except" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_auth_jwt_module.html",
        "variables": ["$jwt_header_name", "$jwt_claim_name"],
        "directives": [{ "directive": "auth_jwt", "syntax": "auth_jwt string [token=$variable] | off", "default": "auth_jwt off", "context": "http, server, location" },
            { "directive": "auth_jwt_header_set", "syntax": "auth_jwt_header_set $variable name", "default": "---", "context": "http" },
            { "directive": "auth_jwt_claim_set", "syntax": "auth_jwt_claim_set $variable name", "default": "---", "context": "http" },
            { "directive": "auth_jwt_key_file", "syntax": "auth_jwt_key_file file", "default": "---", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_auth_request_module.html",
        "variables": [],
        "directives": [{ "directive": "auth_request", "syntax": "auth_request uri | off", "default": "auth_request off", "context": "http, server, location" },
            { "directive": "auth_request_set", "syntax": "auth_request_set $variable value", "default": "---", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_autoindex_module.html",
        "variables": [],
        "directives": [{ "directive": "autoindex", "syntax": "autoindex on | off", "default": "autoindex off", "context": "http, server, location" },
            { "directive": "autoindex_exact_size", "syntax": "autoindex_exact_size on | off", "default": "autoindex_exact_size on", "context": "http, server, location" },
            { "directive": "autoindex_format", "syntax": "autoindex_format html | xml | json | jsonp", "default": "autoindex_format html", "context": "http, server, location" },
            { "directive": "autoindex_localtime", "syntax": "autoindex_localtimeon | off", "default": "autoindex_localtime off", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_browser_module.html",
        "variables": ["$modern_browser", "$ancient_browser", "$msie"],
        "directives": [{ "directive": "ancient_browser", "syntax": "ancient_browser string ...", "default": "---", "context": "http, server, location" },
            { "directive": "ancient_browser_value", "syntax": "ancient_browser_value string", "default": "ancient_browser_value 1", "context": "http, server, location" },
            { "directive": "modern_browser", "syntax": "modern_browser browser version;modern_browser unlisted", "default": "---", "context": "http, server, location" },
            { "directive": "modern_browser_value", "syntax": "modern_browser_value string", "default": "modern_browser_value 1", "context": "http, server,location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_charset_module.html",
        "variables": [],
        "directives": [{ "directive": "charset", "syntax": "charset charset | off", "default": "charset off", "context": "http, server, location, if in location" },
            { "directive": "charset_map", "syntax": "charset_map charset1 charset2 { ... }", "default": "---", "context": "http" },
            { "directive": "charset_types", "syntax": "charset_types mime-type ...", "default": "charset_types text/html text/xml text/plain text/vnd.wap.wmlapplication/javascript application/rss+xml", "context": "http, server, location" },
            { "directive": "override_charset", "syntax": "override_charset on | off", "default": "override_charset off", "context": "http, server, location, if in location" },
            { "directive": "source_charset", "syntax": "source_charset charset", "default": "---", "context": "http, server, location, if in location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_dav_module.html",
        "variables": [],
        "directives": [{ "directive": "dav_access", "syntax": "dav_access users:permissions ...", "default": "dav_access user:rw", "context": "http, server, location" },
            { "directive": "dav_methods", "syntax": "dav_methods off | method ...", "default": "dav_methods off", "context": "http, server, location" },
            { "directive": "create_full_put_path", "syntax": "create_full_put_path on | off", "default": "create_full_put_path off", "context": "http, server, location" },
            { "directive": "min_delete_depth", "syntax": "min_delete_depth number", "default": "min_delete_depth 0", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_empty_gif_module.html",
        "variables": [],
        "directives": [{ "directive": "empty_gif", "syntax": "empty_gif", "default": "---", "context": "location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_f4f_module.html",
        "variables": [],
        "directives": [{ "directive": "f4f", "syntax": "f4f", "default": "---", "context": "location" },
            { "directive": "f4f_buffer_size", "syntax": "f4f_buffer_size size", "default": "f4f_buffer_size 512k", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_fastcgi_module.html",
        "variables": ["$fastcgi_script_name", "$fastcgi_path_info"],
        "directives": [{ "directive": "fastcgi_bind", "syntax": "fastcgi_bind address [transparent] | off", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_buffer_size", "syntax": "fastcgi_buffer_size size", "default": "fastcgi_buffer_size 4k|8k", "context": "http, server, location" },
            { "directive": "fastcgi_buffering", "syntax": "fastcgi_buffering on |off", "default": "fastcgi_buffering on", "context": "http, server, location" },
            { "directive": "fastcgi_buffers", "syntax": "fastcgi_buffers number size", "default": "fastcgi_buffers 8 4k|8k", "context": "http, server,location" },
            { "directive": "fastcgi_busy_buffers_size", "syntax": "fastcgi_busy_buffers_size size", "default": "fastcgi_busy_buffers_size 8k|16k", "context": "http, server, location" },
            { "directive": "fastcgi_cache", "syntax": "fastcgi_cache zone | off", "default": "fastcgi_cache off", "context": "http, server, location" },
            { "directive": "fastcgi_cache_background_update", "syntax": "fastcgi_cache_background_update on | off", "default": "fastcgi_cache_background_update off", "context": "http, server, location" },
            { "directive": "fastcgi_cache_bypass", "syntax": "fastcgi_cache_bypass string ...", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_cache_key", "syntax": "fastcgi_cache_key string", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_cache_lock", "syntax": "fastcgi_cache_lock on | off", "default": "fastcgi_cache_lock off", "context": "http, server, location" },
            { "directive": "fastcgi_cache_lock_age", "syntax": "fastcgi_cache_lock_age time", "default": "fastcgi_cache_lock_age 5s", "context": "http, server, location" },
            { "directive": "fastcgi_cache_lock_timeout", "syntax": "fastcgi_cache_lock_timeout time", "default": "fastcgi_cache_lock_timeout 5s", "context": "http, server, location" },
            { "directive": "fastcgi_cache_max_range_offset", "syntax": "fastcgi_cache_max_range_offset number", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_cache_methods", "syntax": "fastcgi_cache_methods GET | HEAD | POST ...", "default": "fastcgi_cache_methods GET HEAD", "context": "http, server, location" },
            { "directive": "fastcgi_cache_min_uses", "syntax": "fastcgi_cache_min_uses number", "default": "fastcgi_cache_min_uses 1", "context": "http, server, location" },
            { "directive": "fastcgi_cache_path", "syntax": "fastcgi_cache_path path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [manager_files=number] [manager_sleep=time] [manager_threshold=time] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]", "default": "---", "context": "http" },
            { "directive": "fastcgi_cache_purge", "syntax": "fastcgi_cache_purge string ...", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_cache_revalidate", "syntax": "fastcgi_cache_revalidate on | off", "default": "fastcgi_cache_revalidate off", "context": "http, server, location" },
            { "directive": "fastcgi_cache_use_stale", "syntax": "fastcgi_cache_use_stale error | timeout | invalid_header | updating | http_500 | http_503 | http_403 | http_404 | http_429 | off  ...", "default": "fastcgi_cache_use_stale off", "context": "http, server, location" },
            { "directive": "fastcgi_cache_valid", "syntax": "fastcgi_cache_valid [code ...] time", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_catch_stderr", "syntax": "fastcgi_catch_stderr string", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_connect_timeout", "syntax": "fastcgi_connect_timeout time", "default": "fastcgi_connect_timeout 60s", "context": "http, server, location" },
            { "directive": "fastcgi_force_ranges", "syntax": "fastcgi_force_ranges on | off", "default": "fastcgi_force_ranges off", "context": "http, server, location" },
            { "directive": "fastcgi_hide_header", "syntax": "fastcgi_hide_header field", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_ignore_client_abort", "syntax": "fastcgi_ignore_client_abort on | off", "default": "fastcgi_ignore_client_abort off", "context": "http, server, location" },
            { "directive": "fastcgi_ignore_headers", "syntax": "fastcgi_ignore_headers field ...", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_index", "syntax": "fastcgi_index name", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_intercept_errors", "syntax": "fastcgi_intercept_errors on | off", "default": "fastcgi_intercept_errorsoff", "context": "http, server, location" },
            { "directive": "fastcgi_keep_conn", "syntax": "fastcgi_keep_connon | off", "default": "fastcgi_keep_conn off", "context": "http, server, location" },
            { "directive": "fastcgi_limit_rate", "syntax": "fastcgi_limit_rate rate", "default": "fastcgi_limit_rate 0", "context": "http, server, location" },
            { "directive": "fastcgi_max_temp_file_size", "syntax": "fastcgi_max_temp_file_size size", "default": "fastcgi_max_temp_file_size 1024m", "context": "http, server, location" },
            { "directive": "fastcgi_next_upstream", "syntax": "fastcgi_next_upstream error | timeout | invalid_header | http_500 |   http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...", "default": "fastcgi_next_upstream error timeout", "context": "http, server, location" },
            { "directive": "fastcgi_next_upstream_timeout", "syntax": "fastcgi_next_upstream_timeout time", "default": "fastcgi_next_upstream_timeout 0", "context": "http, server, location" },
            { "directive": "fastcgi_next_upstream_tries", "syntax": "fastcgi_next_upstream_tries number", "default": "fastcgi_next_upstream_tries 0", "context": "http, server, location" },
            { "directive": "fastcgi_no_cache", "syntax": "fastcgi_no_cache string ...", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_param", "syntax": "fastcgi_param parameter value [if_not_empty]", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_pass", "syntax": "fastcgi_pass address", "default": "---", "context": "location, if in location" },
            { "directive": "fastcgi_pass_header", "syntax": "fastcgi_pass_header field", "default": "---", "context": "http, server, location" },
            { "directive": "fastcgi_pass_request_body", "syntax": "fastcgi_pass_request_body on | off", "default": "fastcgi_pass_request_body on", "context": "http, server, location" },
            { "directive": "fastcgi_pass_request_headers", "syntax": "fastcgi_pass_request_headers on | off", "default": "fastcgi_pass_request_headerson", "context": "http, server, location" },
            { "directive": "fastcgi_read_timeout", "syntax": "fastcgi_read_timeout time", "default": "fastcgi_read_timeout 60s", "context": "http, server, location" },
            { "directive": "fastcgi_request_buffering", "syntax": "fastcgi_request_buffering on | off", "default": "fastcgi_request_buffering on", "context": "http, server, location" },
            { "directive": "fastcgi_send_lowat", "syntax": "fastcgi_send_lowat size", "default": "fastcgi_send_lowat 0", "context": "http, server, location" },
            { "directive": "fastcgi_send_timeout", "syntax": "fastcgi_send_timeout time", "default": "fastcgi_send_timeout 60s", "context": "http, server, location" },
            { "directive": "fastcgi_split_path_info", "syntax": "fastcgi_split_path_info regex", "default": "---", "context": "location" },
            { "directive": "fastcgi_store", "syntax": "fastcgi_store on |   off | string", "default": "fastcgi_store off", "context": "http, server, location" },
            { "directive": "fastcgi_store_access", "syntax": "fastcgi_store_access users:permissions ...", "default": "fastcgi_store_access user:rw", "context": "http, server, location" },
            { "directive": "fastcgi_temp_file_write_size", "syntax": "fastcgi_temp_file_write_size size", "default": "fastcgi_temp_file_write_size 8k|16k", "context": "http, server, location" },
            { "directive": "fastcgi_temp_path", "syntax": "fastcgi_temp_path path [level1 [level2 [level3]]]", "default": "fastcgi_temp_path fastcgi_temp", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_flv_module.html",
        "variables": [],
        "directives": [{ "directive": "flv", "syntax": "flv", "default": "---", "context": "location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_geo_module.html",
        "variables": [],
        "directives": [{ "directive": "geo", "syntax": "geo [$address] $variable { ... }", "default": "---", "context": "http" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_geoip_module.html",
        "variables": ["$geoip_country_code", "$geoip_country_code3", "$geoip_country_name", "$geoip_area_code", "$geoip_city_continent_code", "$geoip_city_country_code", "$geoip_city_country_code3", "$geoip_city_country_name", "$geoip_dma_code", "$geoip_latitude", "$geoip_longitude", "$geoip_region", "$geoip_region_name", "$geoip_city", "$geoip_postal_code", "$geoip_org"],
        "directives": [{ "directive": "geoip_country", "syntax": "geoip_country file", "default": "---", "context": "http" },
            { "directive": "geoip_city", "syntax": "geoip_city file", "default": "---", "context": "http" },
            { "directive": "geoip_org", "syntax": "geoip_org file", "default": "---", "context": "http" },
            { "directive": "geoip_proxy", "syntax": "geoip_proxy address | CIDR", "default": "---", "context": "http" },
            { "directive": "geoip_proxy_recursive", "syntax": "geoip_proxy_recursive on | off", "default": "geoip_proxy_recursive off", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_gunzip_module.html",
        "variables": [],
        "directives": [{ "directive": "gunzip", "syntax": "gunzip on | off", "default": "gunzip off", "context": "http, server, location" },
            { "directive": "gunzip_buffers", "syntax": "gunzip_buffers number size", "default": "gunzip_buffers 32 4k|16 8k", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_gzip_module.html",
        "variables": ["$gzip_ratio"],
        "directives": [{ "directive": "gzip", "syntax": "gzip on | off", "default": "gzip off", "context": "http,server, location, if in location" },
            { "directive": "gzip_buffers", "syntax": "gzip_buffers number size", "default": "gzip_buffers 32 4k|16 8k", "context": "http, server, location" },
            { "directive": "gzip_comp_level", "syntax": "gzip_comp_level level", "default": "gzip_comp_level 1", "context": "http, server, location" },
            { "directive": "gzip_disable", "syntax": "gzip_disable regex ...", "default": "---", "context": "http, server,location" },
            { "directive": "gzip_min_length", "syntax": "gzip_min_length length", "default": "gzip_min_length 20", "context": "http, server, location" },
            { "directive": "gzip_http_version", "syntax": "gzip_http_version1.0 | 1.1", "default": "gzip_http_version 1.1", "context": "http, server, location" },
            { "directive": "gzip_proxied", "syntax": "gzip_proxied off | expired | no-cache | no-store | private | no_last_modified | no_etag | auth | any ...", "default": "gzip_proxied off", "context": "http, server, location" },
            { "directive": "gzip_types", "syntax": "gzip_types mime-type ...", "default": "gzip_types text/html", "context": "http, server, location" },
            { "directive": "gzip_vary", "syntax": "gzip_vary on | off", "default": "gzip_vary off", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_gzip_static_module.html",
        "variables": [],
        "directives": [{ "directive": "gzip_static", "syntax": "gzip_static on | off | always", "default": "gzip_static off", "context": "http, server, location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_headers_module.html",
        "variables": [],
        "directives": [{ "directive": "add_header", "syntax": "add_header name value[always]", "default": "---", "context": "http, server, location, if in location" },
            { "directive": "expires", "syntax": "expires [modified] time;expires epoch | max | off", "default": "expires off", "context": "http, server, location, if inlocation" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_hls_module.html",
        "variables": [],
        "directives": [{ "directive": "hls", "syntax": "hls", "default": "---", "context": "location" },
            { "directive": "hls_buffers", "syntax": "hls_buffers number size", "default": "hls_buffers 8 2m", "context": "http, server, location" },
            { "directive": "hls_forward_args", "syntax": "hls_forward_args on | off", "default": "hls_forward_args off", "context": "http, server, location" },
            { "directive": "hls_fragment", "syntax": "hls_fragment time", "default": "hls_fragment 5s", "context": "http, server, location" },
            { "directive": "hls_mp4_buffer_size", "syntax": "hls_mp4_buffer_size size", "default": "hls_mp4_buffer_size 512k", "context": "http, server, location" },
            { "directive": "hls_mp4_max_buffer_size", "syntax": "hls_mp4_max_buffer_size size", "default": "hls_mp4_max_buffer_size 10m", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_image_filter_module.html",
        "variables": [],
        "directives": [{ "directive": "image_filter", "syntax": "image_filter off;image_filter test;image_filter size;image_filter rotate 90 | 180 | 270;image_filter resize width height;image_filter crop width height", "default": "image_filter off", "context": "location" },
            { "directive": "image_filter_buffer", "syntax": "image_filter_buffer size", "default": "image_filter_buffer 1M", "context": "http, server, location" },
            { "directive": "image_filter_interlace", "syntax": "image_filter_interlace on | off", "default": "image_filter_interlace off", "context": "http, server, location" },
            { "directive": "image_filter_jpeg_quality", "syntax": "image_filter_jpeg_quality quality", "default": "image_filter_jpeg_quality 75", "context": "http, server, location" },
            { "directive": "image_filter_sharpen", "syntax": "image_filter_sharpen percent", "default": "image_filter_sharpen 0", "context": "http, server, location" },
            { "directive": "image_filter_transparency", "syntax": "image_filter_transparency on|off", "default": "image_filter_transparency on", "context": "http, server, location" },
            { "directive": "image_filter_webp_quality", "syntax": "image_filter_webp_quality quality", "default": "image_filter_webp_quality 80", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_index_module.html",
        "variables": [],
        "directives": [{ "directive": "index", "syntax": "index file ...", "default": "index index.html", "context": "http, server, location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_js_module.html",
        "variables": [],
        "directives": [{ "directive": "js_include", "syntax": "js_include file", "default": "---", "context": "http" },
            { "directive": "js_content", "syntax": "js_content function", "default": "---", "context": "location, limit_except" },
            { "directive": "js_set", "syntax": "js_set $variable function", "default": "---", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_limit_conn_module.html",
        "variables": [],
        "directives": [{ "directive": "limit_conn", "syntax": "limit_conn zone number", "default": "---", "context": "http, server, location" },
            { "directive": "limit_conn_log_level", "syntax": "limit_conn_log_level info |notice |warn |error", "default": "limit_conn_log_level error", "context": "http, server, location" },
            { "directive": "limit_conn_status", "syntax": "limit_conn_status code", "default": "limit_conn_status 503", "context": "http, server, location" },
            { "directive": "limit_conn_zone", "syntax": "limit_conn_zone key zone=name:size", "default": "---", "context": "http" },
            { "directive": "limit_zone", "syntax": "limit_zone name  $variable size", "default": "---", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_limit_req_module.html",
        "variables": [],
        "directives": [{ "directive": "limit_req", "syntax": "limit_req zone=name [burst=number] [nodelay]", "default": "---", "context": "http, server, location" },
            { "directive": "limit_req_log_level", "syntax": "limit_req_log_level info |notice |warn |error", "default": "limit_req_log_level error", "context": "http, server, location" },
            { "directive": "limit_req_status", "syntax": "limit_req_status code", "default": "limit_req_status 503", "context": "http, server, location" },
            { "directive": "limit_req_zone", "syntax": "limit_req_zone key zone=name:size rate=rate", "default": "---", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_log_module.html",
        "variables": ["$bytes_sent", "$connection", "$connection_requests", "$msec", "$pipe", "$request_length", "$request_time", "$status", "$time_iso8601", "$time_local"],
        "directives": [{ "directive": "access_log", "syntax": "access_log path [format [buffer=size] [gzip[=level]] [flush=time] [if=condition]];access_log off", "default": "access_log logs/access.log combined", "context": "http, server, location, if in location, limit_except" },
            { "directive": "log_format", "syntax": "log_format name [escape=default|json] string ...", "default": "log_format combined &quot;...&quot;", "context": "http" },
            { "directive": "open_log_file_cache", "syntax": "open_log_file_cache max=N[inactive=time][min_uses=N][valid=time];open_log_file_cache off", "default": "open_log_file_cache off", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_map_module.html",
        "variables": [],
        "directives": [{ "directive": "map", "syntax": "map string $variable { ... }", "default": "---", "context": "http" },
            { "directive": "map_hash_bucket_size", "syntax": "map_hash_bucket_size size", "default": "map_hash_bucket_size 32|64|128", "context": "http" },
            { "directive": "map_hash_max_size", "syntax": "map_hash_max_size size", "default": "map_hash_max_size 2048", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_memcached_module.html",
        "variables": ["$memcached_key"],
        "directives": [{ "directive": "memcached_bind", "syntax": "memcached_bind address [ transparent ] | off", "default": "---", "context": "http, server, location" },
            { "directive": "memcached_buffer_size", "syntax": "memcached_buffer_size size", "default": "memcached_buffer_size 4k|8k", "context": "http, server, location" },
            { "directive": "memcached_connect_timeout", "syntax": "memcached_connect_timeout time", "default": "memcached_connect_timeout 60s", "context": "http, server, location" },
            { "directive": "memcached_force_ranges", "syntax": "memcached_force_ranges on | off", "default": "memcached_force_ranges off", "context": "http, server, location" },
            { "directive": "memcached_gzip_flag", "syntax": "memcached_gzip_flag flag", "default": "---", "context": "http, server, location" },
            { "directive": "memcached_next_upstream", "syntax": "memcached_next_upstream error | timeout | invalid_response | not_found | off ...", "default": "memcached_next_upstream error timeout", "context": "http, server, location" },
            { "directive": "memcached_next_upstream_timeout", "syntax": "memcached_next_upstream_timeout time", "default": "memcached_next_upstream_timeout 0", "context": "http, server, location" },
            { "directive": "memcached_next_upstream_tries", "syntax": "memcached_next_upstream_tries number", "default": "memcached_next_upstream_tries 0", "context": "http, server, location" },
            { "directive": "memcached_pass", "syntax": "memcached_pass address", "default": "---", "context": "location, if in location" },
            { "directive": "memcached_read_timeout", "syntax": "memcached_read_timeout time", "default": "memcached_read_timeout 60s", "context": "http, server, location" },
            { "directive": "memcached_send_timeout", "syntax": "memcached_send_timeout time", "default": "memcached_send_timeout 60s", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_mp4_module.html",
        "variables": [],
        "directives": [{ "directive": "mp4", "syntax": "mp4", "default": "---", "context": "location" },
            { "directive": "mp4_buffer_size", "syntax": "mp4_buffer_size size", "default": "mp4_buffer_size 512K", "context": "http, server, location" },
            { "directive": "mp4_max_buffer_size", "syntax": "mp4_max_buffer_size size", "default": "mp4_max_buffer_size 10M", "context": "http, server, location" },
            { "directive": "mp4_limit_rate", "syntax": "mp4_limit_rate on | off | factor", "default": "mp4_limit_rate off", "context": "http, server, location" },
            { "directive": "mp4_limit_rate_after", "syntax": "mp4_limit_rate_after time", "default": "mp4_limit_rate_after 60s", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_perl_module.html",
        "variables": ["$r-&gt;args", "$r-&gt;filename", "$r-&gt;has_request_body(handler)", "$r-&gt;allow_ranges", "$r-&gt;discard_request_body", "$r-&gt;header_in(field)", "$r-&gt;header_only", "$r-&gt;header_out(field, value)", "$r-&gt;internal_redirect(uri)", "$r-&gt;log_error(errno,message)", "$r-&gt;print(text, ...)", "$r-&gt;request_body", "$r-&gt;request_body_file", "$r-&gt;request_method", "$r-&gt;remote_addr", "$r-&gt;flush", "$r-&gt;sendfile(name[, offset[, length]])", "$r-&gt;send_http_header([type])", "$r-&gt;status(code)", "$r-&gt;sleep(milliseconds, handler)", "$r-&gt;unescape(text)", "$r-&gt;uri", "$r-&gt;variable(name[, value])"],
        "directives": [{ "directive": "perl", "syntax": "perl module::function|&apos;sub { ... }&apos;", "default": "---", "context": "location, limit_except" },
            { "directive": "perl_modules", "syntax": "perl_modules path", "default": "---", "context": "http" },
            { "directive": "perl_require", "syntax": "perl_require module", "default": "---", "context": "http" },
            { "directive": "perl_set", "syntax": "perl_set $variable module::function|&apos;sub { ... }&apos;", "default": "---", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_proxy_module.html",
        "variables": ["$proxy_host", "$proxy_port", "$proxy_add_x_forwarded_for"],
        "directives": [{ "directive": "proxy_bind", "syntax": "proxy_bind address [transparent] | off", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_buffer_size", "syntax": "proxy_buffer_size size", "default": "proxy_buffer_size 4k|8k", "context": "http, server, location" },
            { "directive": "proxy_buffering", "syntax": "proxy_buffering on | off", "default": "proxy_buffering on", "context": "http, server, location" },
            { "directive": "proxy_buffers", "syntax": "proxy_buffers number size", "default": "proxy_buffers 8 4k|8k", "context": "http, server, location" },
            { "directive": "proxy_busy_buffers_size", "syntax": "proxy_busy_buffers_size size", "default": "proxy_busy_buffers_size 8k|16k", "context": "http, server, location" },
            { "directive": "proxy_cache", "syntax": "proxy_cache zone | off", "default": "proxy_cache off", "context": "http, server, location" },
            { "directive": "proxy_cache_background_update", "syntax": "proxy_cache_background_update on | off", "default": "proxy_cache_background_update off", "context": "http, server, location" },
            { "directive": "proxy_cache_bypass", "syntax": "proxy_cache_bypass string ...", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_cache_convert_head", "syntax": "proxy_cache_convert_head on | off", "default": "proxy_cache_convert_head on", "context": "http, server, location" },
            { "directive": "proxy_cache_key", "syntax": "proxy_cache_key string", "default": "proxy_cache_key $scheme$proxy_host$request_uri", "context": "http, server, location" },
            { "directive": "proxy_cache_lock", "syntax": "proxy_cache_lock on | off", "default": "proxy_cache_lock off", "context": "http, server, location" },
            { "directive": "proxy_cache_lock_age", "syntax": "proxy_cache_lock_age time", "default": "proxy_cache_lock_age 5s", "context": "http, server, location" },
            { "directive": "proxy_cache_lock_timeout", "syntax": "proxy_cache_lock_timeout time", "default": "proxy_cache_lock_timeout 5s", "context": "http, server, location" },
            { "directive": "proxy_cache_max_range_offset", "syntax": "proxy_cache_max_range_offset number", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_cache_methods", "syntax": "proxy_cache_methods GET | HEAD | POST ...", "default": "proxy_cache_methods GET HEAD", "context": "http, server, location" },
            { "directive": "proxy_cache_min_uses", "syntax": "proxy_cache_min_uses number", "default": "proxy_cache_min_uses 1", "context": "http, server, location" },
            { "directive": "proxy_cache_path", "syntax": "proxy_cache_path path [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [manager_files=number] [manager_sleep=time]   [manager_threshold=time] [loader_files=number] [loader_sleep=time] [loader_threshold=time]   [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]", "default": "---", "context": "http" },
            { "directive": "proxy_cache_purge", "syntax": "proxy_cache_purge string ...", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_cache_revalidate", "syntax": "proxy_cache_revalidate on | off", "default": "proxy_cache_revalidate off", "context": "http, server, location" },
            { "directive": "proxy_cache_use_stale", "syntax": "proxy_cache_use_stale error | timeout |   invalid_header | updating | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | off ...", "default": "proxy_cache_use_stale off", "context": "http, server, location" },
            { "directive": "proxy_cache_valid", "syntax": "proxy_cache_valid [code ...] time", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_connect_timeout", "syntax": "proxy_connect_timeout time", "default": "proxy_connect_timeout 60s", "context": "http, server, location" },
            { "directive": "proxy_cookie_domain", "syntax": "proxy_cookie_domain off;proxy_cookie_domain domain replacement", "default": "proxy_cookie_domain off", "context": "http, server, location" },
            { "directive": "proxy_cookie_path", "syntax": "proxy_cookie_path off;proxy_cookie_path path replacement", "default": "proxy_cookie_path off", "context": "http, server, location" },
            { "directive": "proxy_force_ranges", "syntax": "proxy_force_ranges on| off", "default": "proxy_force_ranges off", "context": "http, server, location" },
            { "directive": "proxy_headers_hash_bucket_size", "syntax": "proxy_headers_hash_bucket_size size", "default": "proxy_headers_hash_bucket_size 64", "context": "http, server, location" },
            { "directive": "proxy_headers_hash_max_size", "syntax": "proxy_headers_hash_max_size size", "default": "proxy_headers_hash_max_size 512", "context": "http, server, location" },
            { "directive": "proxy_hide_header", "syntax": "proxy_hide_header field", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_http_version", "syntax": "proxy_http_version 1.0 | 1.1", "default": "proxy_http_version 1.0", "context": "http, server, location" },
            { "directive": "proxy_ignore_client_abort", "syntax": "proxy_ignore_client_abort on | off", "default": "proxy_ignore_client_abort off", "context": "http, server, location" },
            { "directive": "proxy_ignore_headers", "syntax": "proxy_ignore_headersfield ...", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_intercept_errors", "syntax": "proxy_intercept_errors on | off", "default": "proxy_intercept_errors off", "context": "http, server, location" },
            { "directive": "proxy_limit_rate", "syntax": "proxy_limit_rate rate", "default": "proxy_limit_rate 0", "context": "http, server, location" },
            { "directive": "proxy_max_temp_file_size", "syntax": "proxy_max_temp_file_size size", "default": "proxy_max_temp_file_size 1024m", "context": "http, server, location" },
            { "directive": "proxy_method", "syntax": "proxy_method method", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_next_upstream", "syntax": "proxy_next_upstream error | timeout | invalid_header | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | non_idempotent | off ...", "default": "proxy_next_upstream error timeout", "context": "http, server, location" },
            { "directive": "proxy_next_upstream_timeout", "syntax": "proxy_next_upstream_timeout time", "default": "proxy_next_upstream_timeout 0", "context": "http, server, location" },
            { "directive": "proxy_next_upstream_tries", "syntax": "proxy_next_upstream_tries number", "default": "proxy_next_upstream_tries 0", "context": "http, server, location" },
            { "directive": "proxy_no_cache", "syntax": "proxy_no_cache string ...", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_pass", "syntax": "proxy_pass URL", "default": "---", "context": "location, if in location, limit_except" },
            { "directive": "proxy_pass_header", "syntax": "proxy_pass_header field", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_pass_request_body", "syntax": "proxy_pass_request_body on | off", "default": "proxy_pass_request_body on", "context": "http, server, location" },
            { "directive": "proxy_pass_request_headers", "syntax": "proxy_pass_request_headers on | off", "default": "proxy_pass_request_headers on", "context": "http, server, location" },
            { "directive": "proxy_read_timeout", "syntax": "proxy_read_timeout time", "default": "proxy_read_timeout 60s", "context": "http, server, location" },
            { "directive": "proxy_redirect", "syntax": "proxy_redirect default;proxy_redirect off;proxy_redirect redirect replacement", "default": "proxy_redirect default", "context": "http, server, location" },
            { "directive": "proxy_request_buffering", "syntax": "proxy_request_buffering on | off", "default": "proxy_request_buffering on", "context": "http, server, location" },
            { "directive": "proxy_send_lowat", "syntax": "proxy_send_lowat size", "default": "proxy_send_lowat 0", "context": "http, server, location" },
            { "directive": "proxy_send_timeout", "syntax": "proxy_send_timeout time", "default": "proxy_send_timeout 60s", "context": "http, server, location" },
            { "directive": "proxy_set_body", "syntax": "proxy_set_body value", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_set_header", "syntax": "proxy_set_header field value", "default": "proxy_set_header Host $proxy_host;proxy_set_header Connection close", "context": "http, server, location" },
            { "directive": "proxy_ssl_certificate", "syntax": "proxy_ssl_certificate file", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_ssl_certificate_key", "syntax": "proxy_ssl_certificate_key file", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_ssl_ciphers", "syntax": "proxy_ssl_ciphers ciphers", "default": "proxy_ssl_ciphers DEFAULT", "context": "http, server, location" },
            { "directive": "proxy_ssl_crl", "syntax": "proxy_ssl_crl file", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_ssl_name", "syntax": "proxy_ssl_name name", "default": "proxy_ssl_name $proxy_host", "context": "http, server, location" },
            { "directive": "proxy_ssl_password_file", "syntax": "proxy_ssl_password_file file", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_ssl_server_name", "syntax": "proxy_ssl_server_name on | off", "default": "proxy_ssl_server_name off", "context": "http, server, location" },
            { "directive": "proxy_ssl_session_reuse", "syntax": "proxy_ssl_session_reuse on | off", "default": "proxy_ssl_session_reuse on", "context": "http, server, location" },
            { "directive": "proxy_ssl_protocols", "syntax": "proxy_ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "proxy_ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "http, server, location" },
            { "directive": "proxy_ssl_trusted_certificate", "syntax": "proxy_ssl_trusted_certificate file", "default": "---", "context": "http, server, location" },
            { "directive": "proxy_ssl_verify", "syntax": "proxy_ssl_verify on | off", "default": "proxy_ssl_verify off", "context": "http, server, location" },
            { "directive": "proxy_ssl_verify_depth", "syntax": "proxy_ssl_verify_depth number", "default": "proxy_ssl_verify_depth 1", "context": "http, server, location" },
            { "directive": "proxy_store", "syntax": "proxy_store on | off | string", "default": "proxy_store off", "context": "http, server, location" },
            { "directive": "proxy_store_access", "syntax": "proxy_store_access users:permissions ...", "default": "proxy_store_access user:rw", "context": "http, server, location" },
            { "directive": "proxy_temp_file_write_size", "syntax": "proxy_temp_file_write_size size", "default": "proxy_temp_file_write_size 8k|16k", "context": "http, server, location" },
            { "directive": "proxy_temp_path", "syntax": "proxy_temp_path path [level1 [level2 [level3]]]", "default": "proxy_temp_path proxy_temp", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_random_index_module.html",
        "variables": [],
        "directives": [{ "directive": "random_index", "syntax": "random_index on | off", "default": "random_index off", "context": "location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_realip_module.html",
        "variables": ["$realip_remote_addr", "$realip_remote_port"],
        "directives": [{ "directive": "set_real_ip_from", "syntax": "set_real_ip_from address | CIDR | unix:", "default": "---", "context": "http, server, location" },
            { "directive": "real_ip_header", "syntax": "real_ip_header field | X-Real-IP | X-Forwarded-For | proxy_protocol", "default": "real_ip_header X-Real-IP", "context": "http, server, location" },
            { "directive": "real_ip_recursive", "syntax": "real_ip_recursive on | off", "default": "real_ip_recursive off", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_referer_module.html",
        "variables": ["$invalid_referer"],
        "directives": [{ "directive": "referer_hash_bucket_size", "syntax": "referer_hash_bucket_sizesize", "default": "referer_hash_bucket_size 64", "context": "server, location" },
            { "directive": "referer_hash_max_size", "syntax": "referer_hash_max_size size", "default": "referer_hash_max_size 2048", "context": "server, location" },
            { "directive": "valid_referers", "syntax": "valid_referers none | blocked | server_names | string ...", "default": "---", "context": "server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_rewrite_module.html",
        "variables": [],
        "directives": [{ "directive": "break", "syntax": "break", "default": "---", "context": "server, location, if" },
            { "directive": "if", "syntax": "if (condition) { ... }", "default": "---", "context": "server, location" },
            { "directive": "return", "syntax": "return code [text];return code URL;return URL", "default": "---", "context": "server, location, if" },
            { "directive": "rewrite", "syntax": "rewrite regex replacement [flag]", "default": "---", "context": "server, location, if" },
            { "directive": "rewrite_log", "syntax": "rewrite_log on | off", "default": "rewrite_log off", "context": "http, server, location, if" },
            { "directive": "set", "syntax": "set $variable value", "default": "---", "context": "server, location, if" },
            { "directive": "uninitialized_variable_warn", "syntax": "uninitialized_variable_warn on | off", "default": "uninitialized_variable_warn on", "context": "http, server, location, if" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_scgi_module.html",
        "variables": [],
        "directives": [{ "directive": "scgi_bind", "syntax": "scgi_bind address [transparent] | off", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_buffer_size", "syntax": "scgi_buffer_size size", "default": "scgi_buffer_size 4k|8k", "context": "http, server, location" },
            { "directive": "scgi_buffering", "syntax": "scgi_buffering on | off", "default": "scgi_buffering on", "context": "http, server, location" },
            { "directive": "scgi_buffers", "syntax": "scgi_buffers number size", "default": "scgi_buffers 8 4k|8k", "context": "http, server, location" },
            { "directive": "scgi_busy_buffers_size", "syntax": "scgi_busy_buffers_size size", "default": "scgi_busy_buffers_size 8k|16k", "context": "http, server, location" },
            { "directive": "scgi_cache", "syntax": "scgi_cache zone | off", "default": "scgi_cache off", "context": "http, server, location" },
            { "directive": "scgi_cache_background_update", "syntax": "scgi_cache_background_update on | off", "default": "scgi_cache_background_update off", "context": "http, server, location" },
            { "directive": "scgi_cache_bypass", "syntax": "scgi_cache_bypass string ...", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_cache_key", "syntax": "scgi_cache_key string", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_cache_lock", "syntax": "scgi_cache_lock on | off", "default": "scgi_cache_lock off", "context": "http, server, location" },
            { "directive": "scgi_cache_lock_age", "syntax": "scgi_cache_lock_age time", "default": "scgi_cache_lock_age 5s", "context": "http, server, location" },
            { "directive": "scgi_cache_lock_timeout", "syntax": "scgi_cache_lock_timeout time", "default": "scgi_cache_lock_timeout5s", "context": "http, server, location" },
            { "directive": "scgi_cache_max_range_offset", "syntax": "scgi_cache_max_range_offset number", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_cache_methods", "syntax": "scgi_cache_methods GET | HEAD | POST ...", "default": "scgi_cache_methods GET HEAD", "context": "http, server, location" },
            { "directive": "scgi_cache_min_uses", "syntax": "scgi_cache_min_uses number", "default": "scgi_cache_min_uses 1", "context": "http, server, location" },
            { "directive": "scgi_cache_path", "syntax": "scgi_cache_path path [levels=levels] [use_temp_path=on|off]   keys_zone=name:size [inactive=time] [max_size=size] [manager_files=number] [manager_sleep=time] [manager_threshold=time] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]", "default": "---", "context": "http" },
            { "directive": "scgi_cache_purge", "syntax": "scgi_cache_purge string ...", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_cache_revalidate", "syntax": "scgi_cache_revalidate on | off", "default": "scgi_cache_revalidate off", "context": "http, server,location" },
            { "directive": "scgi_cache_use_stale", "syntax": "scgi_cache_use_stale error | timeout | invalid_header | updating | http_500 | http_503 | http_403 | http_404 | http_429| off ...", "default": "scgi_cache_use_stale off", "context": "http, server, location" },
            { "directive": "scgi_cache_valid", "syntax": "scgi_cache_valid [code ...] time", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_connect_timeout", "syntax": "scgi_connect_timeout time", "default": "scgi_connect_timeout 60s", "context": "http, server, location" },
            { "directive": "scgi_force_ranges", "syntax": "scgi_force_ranges on | off", "default": "scgi_force_ranges off", "context": "http, server, location" },
            { "directive": "scgi_hide_header", "syntax": "scgi_hide_header field", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_ignore_client_abort", "syntax": "scgi_ignore_client_abort on | off", "default": "scgi_ignore_client_abort off", "context": "http, server, location" },
            { "directive": "scgi_ignore_headers", "syntax": "scgi_ignore_headers field ...", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_intercept_errors", "syntax": "scgi_intercept_errors on | off", "default": "scgi_intercept_errors off", "context": "http, server, location" },
            { "directive": "scgi_limit_rate", "syntax": "scgi_limit_rate rate", "default": "scgi_limit_rate 0", "context": "http, server, location" },
            { "directive": "scgi_max_temp_file_size", "syntax": "scgi_max_temp_file_size size", "default": "scgi_max_temp_file_size 1024m", "context": "http, server, location" },
            { "directive": "scgi_next_upstream", "syntax": "scgi_next_upstream error | timeout | invalid_header | http_500 | http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...", "default": "scgi_next_upstream error timeout", "context": "http, server, location" },
            { "directive": "scgi_next_upstream_timeout", "syntax": "scgi_next_upstream_timeout time", "default": "scgi_next_upstream_timeout 0", "context": "http, server, location" },
            { "directive": "scgi_next_upstream_tries", "syntax": "scgi_next_upstream_tries number", "default": "scgi_next_upstream_tries 0", "context": "http, server, location" },
            { "directive": "scgi_no_cache", "syntax": "scgi_no_cache string ...", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_param", "syntax": "scgi_param parameter value [if_not_empty]", "default": "---", "context": "http, server, location" },
            { "directive": "scgi_pass", "syntax": "scgi_pass address", "default": "---", "context": "location, if in location" },
            { "directive": "scgi_pass_header", "syntax": "scgi_pass_header field", "default": "---", "context": "http,server, location" },
            { "directive": "scgi_pass_request_body", "syntax": "scgi_pass_request_body on | off", "default": "scgi_pass_request_body on", "context": "http, server, location" },
            { "directive": "scgi_pass_request_headers", "syntax": "scgi_pass_request_headers on | off", "default": "scgi_pass_request_headers on", "context": "http, server, location" },
            { "directive": "scgi_read_timeout", "syntax": "scgi_read_timeout time", "default": "scgi_read_timeout 60s", "context": "http, server, location" },
            { "directive": "scgi_request_buffering", "syntax": "scgi_request_buffering on | off", "default": "scgi_request_buffering on", "context": "http, server, location" },
            { "directive": "scgi_send_timeout", "syntax": "scgi_send_timeout time", "default": "scgi_send_timeout 60s", "context": "http, server, location" },
            { "directive": "scgi_store", "syntax": "scgi_storeon | off | string", "default": "scgi_store off", "context": "http, server, location" },
            { "directive": "scgi_store_access", "syntax": "scgi_store_access users:permissions ...", "default": "scgi_store_access user:rw", "context": "http, server, location" },
            { "directive": "scgi_temp_file_write_size", "syntax": "scgi_temp_file_write_size size", "default": "scgi_temp_file_write_size 8k|16k", "context": "http, server, location" },
            { "directive": "scgi_temp_path", "syntax": "scgi_temp_path path [level1 [level2 [level3]]]", "default": "scgi_temp_path scgi_temp", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_secure_link_module.html",
        "variables": [],
        "directives": [{ "directive": "secure_link", "syntax": "secure_link expression", "default": "---", "context": "http, server, location" },
            { "directive": "secure_link_md5", "syntax": "secure_link_md5 expression", "default": "---", "context": "http, server, location" },
            { "directive": "secure_link_secret", "syntax": "secure_link_secret word", "default": "---", "context": "location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_session_log_module.html",
        "variables": ["$session_log_id", "$session_log_binary_id"],
        "directives": [{ "directive": "session_log_format", "syntax": "session_log_format name string ...", "default": "session_log_format combined &quot;...&quot;", "context": "http" },
            { "directive": "session_log_zone", "syntax": "session_log_zone path zone=name:size [format=format] [timeout=time] [id=id] [md5=md5]", "default": "---", "context": "http" },
            { "directive": "session_log", "syntax": "session_log name | off", "default": "session_log off", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_slice_module.html",
        "variables": ["$slice_range"],
        "directives": [{ "directive": "slice", "syntax": "slice size", "default": "slice 0", "context": "http, server, location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_spdy_module.html",
        "variables": [],
        "directives": [{ "directive": "spdy_chunk_size", "syntax": "spdy_chunk_size size", "default": "spdy_chunk_size 8k", "context": "http, server, location" },
            { "directive": "spdy_headers_comp", "syntax": "spdy_headers_comp level", "default": "spdy_headers_comp 0", "context": "http, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_split_clients_module.html",
        "variables": [],
        "directives": [{ "directive": "split_clients", "syntax": "split_clients string $variable { ... }", "default": "---", "context": "http" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_ssi_module.html",
        "variables": ["$date_local", "$date_gmt"],
        "directives": [{ "directive": "ssi", "syntax": "ssi on | off", "default": "ssi off", "context": "http, server, location, if in location" },
            { "directive": "ssi_last_modified", "syntax": "ssi_last_modified on | off", "default": "ssi_last_modified off", "context": "http, server, location" },
            { "directive": "ssi_min_file_chunk", "syntax": "ssi_min_file_chunk size", "default": "ssi_min_file_chunk 1k", "context": "http, server, location" },
            { "directive": "ssi_silent_errors", "syntax": "ssi_silent_errors on | off", "default": "ssi_silent_errors off", "context": "http, server, location" },
            { "directive": "ssi_types", "syntax": "ssi_types mime-type ...", "default": "ssi_types text/html", "context": "http, server, location" },
            { "directive": "ssi_value_length", "syntax": "ssi_value_length length", "default": "ssi_value_length 256", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_ssl_module.html",
        "variables": ["$ssl_cipher", "$ssl_ciphers", "$ssl_client_cert", "$ssl_client_fingerprint", "$ssl_client_i_dn", "$ssl_client_i_dn_legacy", "$ssl_client_raw_cert", "$ssl_client_s_dn", "$ssl_client_s_dn_legacy", "$ssl_client_serial", "$ssl_client_v_end", "$ssl_client_v_remain", "$ssl_client_v_start", "$ssl_client_verify", "$ssl_curves", "$ssl_protocol", "$ssl_server_name", "$ssl_session_id", "$ssl_session_reused"],
        "directives": [{ "directive": "ssl", "syntax": "ssl on | off", "default": "ssl off", "context": "http, server" },
            { "directive": "ssl_buffer_size", "syntax": "ssl_buffer_size size", "default": "ssl_buffer_size 16k", "context": "http, server" },
            { "directive": "ssl_certificate", "syntax": "ssl_certificate file", "default": "---", "context": "http, server" },
            { "directive": "ssl_certificate_key", "syntax": "ssl_certificate_key file", "default": "---", "context": "http, server" },
            { "directive": "ssl_ciphers", "syntax": "ssl_ciphers ciphers", "default": "ssl_ciphers HIGH:!aNULL:!MD5", "context": "http, server" },
            { "directive": "ssl_client_certificate", "syntax": "ssl_client_certificate file", "default": "---", "context": "http, server" },
            { "directive": "ssl_crl", "syntax": "ssl_crl file", "default": "---", "context": "http, server" },
            { "directive": "ssl_dhparam", "syntax": "ssl_dhparam file", "default": "---", "context": "http, server" },
            { "directive": "ssl_ecdh_curve", "syntax": "ssl_ecdh_curve curve", "default": "ssl_ecdh_curve auto", "context": "http, server" },
            { "directive": "ssl_password_file", "syntax": "ssl_password_file file", "default": "---", "context": "http, server" },
            { "directive": "ssl_prefer_server_ciphers", "syntax": "ssl_prefer_server_ciphers on | off", "default": "ssl_prefer_server_ciphers off", "context": "http, server" },
            { "directive": "ssl_protocols", "syntax": "ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "http, server" },
            { "directive": "ssl_session_cache", "syntax": "ssl_session_cache off | none | [builtin[:size]] [shared:name:size]", "default": "ssl_session_cache none", "context": "http, server" },
            { "directive": "ssl_session_ticket_key", "syntax": "ssl_session_ticket_key file", "default": "---", "context": "http, server" },
            { "directive": "ssl_session_tickets", "syntax": "ssl_session_tickets on | off", "default": "ssl_session_tickets on", "context": "http, server" },
            { "directive": "ssl_session_timeout", "syntax": "ssl_session_timeout time", "default": "ssl_session_timeout 5m", "context": "http, server" },
            { "directive": "ssl_stapling", "syntax": "ssl_stapling on | off", "default": "ssl_stapling off", "context": "http, server" },
            { "directive": "ssl_stapling_file", "syntax": "ssl_stapling_file file", "default": "---", "context": "http, server" },
            { "directive": "ssl_stapling_responder", "syntax": "ssl_stapling_responder url", "default": "---", "context": "http, server" },
            { "directive": "ssl_stapling_verify", "syntax": "ssl_stapling_verify on | off", "default": "ssl_stapling_verify off", "context": "http, server" },
            { "directive": "ssl_trusted_certificate", "syntax": "ssl_trusted_certificate file", "default": "---", "context": "http, server" },
            { "directive": "ssl_verify_client", "syntax": "ssl_verify_client on | off | optional | optional_no_ca", "default": "ssl_verify_client off", "context": "http, server" },
            { "directive": "ssl_verify_depth", "syntax": "ssl_verify_depth number", "default": "ssl_verify_depth 1", "context": "http, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_status_module.html",
        "variables": [],
        "directives": [{ "directive": "status", "syntax": "status", "default": "---", "context": "location" },
            { "directive": "status_format", "syntax": "status_format json;status_format jsonp [callback]", "default": "status_format json", "context": "http, server, location" },
            { "directive": "status_zone", "syntax": "status_zone zone", "default": "---", "context": "server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_stub_status_module.html",
        "variables": ["$connections_active", "$connections_reading", "$connections_writing", "$connections_waiting"],
        "directives": [{ "directive": "stub_status", "syntax": "stub_status", "default": "---", "context": "server, location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_sub_module.html",
        "variables": [],
        "directives": [{ "directive": "sub_filter", "syntax": "sub_filter string replacement", "default": "---", "context": "http, server, location" },
            { "directive": "sub_filter_last_modified", "syntax": "sub_filter_last_modified on | off", "default": "sub_filter_last_modified off", "context": "http, server, location" },
            { "directive": "sub_filter_once", "syntax": "sub_filter_once on | off", "default": "sub_filter_once on", "context": "http, server, location" },
            { "directive": "sub_filter_types", "syntax": "sub_filter_types mime-type ...", "default": "sub_filter_types text/html", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_upstream_module.html",
        "variables": ["$upstream_addr", "$upstream_bytes_received", "$upstream_cache_status", "$upstream_connect_time", "$upstream_cookie_name", "$upstream_header_time", "$upstream_http_name", "$upstream_response_length", "$upstream_response_time", "$upstream_status"],
        "directives": [{ "directive": "upstream", "syntax": "upstream name { ... }", "default": "---", "context": "http" },
            { "directive": "server", "syntax": "server address [parameters]", "default": "---", "context": "upstream" },
            { "directive": "zone", "syntax": "zone name [size]", "default": "---", "context": "upstream" },
            { "directive": "state", "syntax": "state file", "default": "---", "context": "upstream" },
            { "directive": "hash", "syntax": "hash key [consistent]", "default": "---", "context": "upstream" },
            { "directive": "ip_hash", "syntax": "ip_hash", "default": "---", "context": "upstream" },
            { "directive": "keepalive", "syntax": "keepalive connections", "default": "---", "context": "upstream" },
            { "directive": "ntlm", "syntax": "ntlm", "default": "---", "context": "upstream" },
            { "directive": "least_conn", "syntax": "least_conn", "default": "---", "context": "upstream" },
            { "directive": "least_time", "syntax": "least_time header| last_byte [inflight]", "default": "---", "context": "upstream" },
            { "directive": "queue", "syntax": "queue number[timeout=time]", "default": "---", "context": "upstream" },
            { "directive": "sticky", "syntax": "sticky cookie name [expires=time] [domain=domain] [httponly] [secure] [path=path];sticky route $variable ...;sticky learn create=$variable lookup=$variable zone=name:size [timeout=time]", "default": "---", "context": "upstream" },
            { "directive": "sticky_cookie_insert", "syntax": "sticky_cookie_insert name[expires=time][domain=domain][path=path]", "default": "---", "context": "upstream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_upstream_conf_module.html",
        "variables": [],
        "directives": [{ "directive": "upstream_conf", "syntax": "upstream_conf", "default": "---", "context": "location" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_upstream_hc_module.html",
        "variables": [],
        "directives": [{ "directive": "health_check", "syntax": "health_check [parameters]", "default": "---", "context": "location" },
            { "directive": "match", "syntax": "match name { ... }", "default": "---", "context": "http" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_userid_module.html",
        "variables": ["$uid_got", "$uid_reset", "$uid_set"],
        "directives": [{ "directive": "userid", "syntax": "userid on | v1 | log | off", "default": "userid off", "context": "http, server, location" },
            { "directive": "userid_domain", "syntax": "userid_domain name | none", "default": "userid_domain none", "context": "http, server, location" },
            { "directive": "userid_expires", "syntax": "userid_expires time | max | off", "default": "userid_expiresoff", "context": "http, server, location" },
            { "directive": "userid_mark", "syntax": "userid_mark letter | digit | = | off", "default": "userid_mark off", "context": "http, server, location" },
            { "directive": "userid_name", "syntax": "userid_name name", "default": "userid_name uid", "context": "http, server, location" },
            { "directive": "userid_p3p", "syntax": "userid_p3p string | none", "default": "userid_p3p none", "context": "http, server, location" },
            { "directive": "userid_path", "syntax": "userid_path path", "default": "userid_path /", "context": "http, server, location" },
            { "directive": "userid_service", "syntax": "userid_service number", "default": "userid_service IP address of the server", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_uwsgi_module.html",
        "variables": [],
        "directives": [{ "directive": "uwsgi_bind", "syntax": "uwsgi_bind address [transparent] | off", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_buffer_size", "syntax": "uwsgi_buffer_size size", "default": "uwsgi_buffer_size 4k|8k", "context": "http, server, location" },
            { "directive": "uwsgi_buffering", "syntax": "uwsgi_buffering on | off", "default": "uwsgi_buffering on", "context": "http, server, location" },
            { "directive": "uwsgi_buffers", "syntax": "uwsgi_buffers number size", "default": "uwsgi_buffers 8 4k|8k", "context": "http, server, location" },
            { "directive": "uwsgi_busy_buffers_size", "syntax": "uwsgi_busy_buffers_size size", "default": "uwsgi_busy_buffers_size 8k|16k", "context": "http, server, location" },
            { "directive": "uwsgi_cache", "syntax": "uwsgi_cache zone | off", "default": "uwsgi_cache off", "context": "http, server, location" },
            { "directive": "uwsgi_cache_background_update", "syntax": "uwsgi_cache_background_update on | off", "default": "uwsgi_cache_background_update off", "context": "http, server, location" },
            { "directive": "uwsgi_cache_bypass", "syntax": "uwsgi_cache_bypass string ...", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_cache_key", "syntax": "uwsgi_cache_key string", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_cache_lock", "syntax": "uwsgi_cache_lockon | off", "default": "uwsgi_cache_lock off", "context": "http, server, location" },
            { "directive": "uwsgi_cache_lock_age", "syntax": "uwsgi_cache_lock_age time", "default": "uwsgi_cache_lock_age 5s", "context": "http,server, location" },
            { "directive": "uwsgi_cache_lock_timeout", "syntax": "uwsgi_cache_lock_timeout time", "default": "uwsgi_cache_lock_timeout 5s", "context": "http, server, location" },
            { "directive": "uwsgi_cache_max_range_offset", "syntax": "uwsgi_cache_max_range_offset number", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_cache_methods", "syntax": "uwsgi_cache_methods GET | HEAD |  POST ...", "default": "uwsgi_cache_methods GET HEAD", "context": "http, server, location" },
            { "directive": "uwsgi_cache_min_uses", "syntax": "uwsgi_cache_min_uses number", "default": "uwsgi_cache_min_uses 1", "context": "http, server, location" },
            { "directive": "uwsgi_cache_path", "syntax": "uwsgi_cache_path path  [levels=levels] [use_temp_path=on|off] keys_zone=name:size [inactive=time] [max_size=size] [manager_files=number] [manager_sleep=time] [manager_threshold=time] [loader_files=number] [loader_sleep=time] [loader_threshold=time] [purger=on|off] [purger_files=number] [purger_sleep=time] [purger_threshold=time]", "default": "---", "context": "http" },
            { "directive": "uwsgi_cache_purge", "syntax": "uwsgi_cache_purge string ...", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_cache_revalidate", "syntax": "uwsgi_cache_revalidate on | off", "default": "uwsgi_cache_revalidate off", "context": "http, server, location" },
            { "directive": "uwsgi_cache_use_stale", "syntax": "uwsgi_cache_use_stale error | timeout | invalid_header | updating | http_500 |http_503 | http_403 | http_404 | http_429 | off ...", "default": "uwsgi_cache_use_stale off", "context": "http, server, location" },
            { "directive": "uwsgi_cache_valid", "syntax": "uwsgi_cache_valid [code ...] time", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_connect_timeout", "syntax": "uwsgi_connect_timeout time", "default": "uwsgi_connect_timeout 60s", "context": "http, server, location" },
            { "directive": "uwsgi_force_ranges", "syntax": "uwsgi_force_ranges on | off", "default": "uwsgi_force_ranges off", "context": "http, server, location" },
            { "directive": "uwsgi_hide_header", "syntax": "uwsgi_hide_header field", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ignore_client_abort", "syntax": "uwsgi_ignore_client_abort on | off", "default": "uwsgi_ignore_client_abort off", "context": "http, server, location" },
            { "directive": "uwsgi_ignore_headers", "syntax": "uwsgi_ignore_headers field ...", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_intercept_errors", "syntax": "uwsgi_intercept_errors on | off", "default": "uwsgi_intercept_errors off", "context": "http, server, location" },
            { "directive": "uwsgi_limit_rate", "syntax": "uwsgi_limit_rate rate", "default": "uwsgi_limit_rate 0", "context": "http, server, location" },
            { "directive": "uwsgi_max_temp_file_size", "syntax": "uwsgi_max_temp_file_size size", "default": "uwsgi_max_temp_file_size 1024m", "context": "http, server, location" },
            { "directive": "uwsgi_modifier1", "syntax": "uwsgi_modifier1 number", "default": "uwsgi_modifier1 0", "context": "http, server, location" },
            { "directive": "uwsgi_modifier2", "syntax": "uwsgi_modifier2 number", "default": "uwsgi_modifier2 0", "context": "http, server, location" },
            { "directive": "uwsgi_next_upstream", "syntax": "uwsgi_next_upstream error | timeout | invalid_header | http_500 | http_503 | http_403 | http_404 | http_429 | non_idempotent | off ...", "default": "uwsgi_next_upstream error timeout", "context": "http, server, location" },
            { "directive": "uwsgi_next_upstream_timeout", "syntax": "uwsgi_next_upstream_timeout time", "default": "uwsgi_next_upstream_timeout 0", "context": "http, server, location" },
            { "directive": "uwsgi_next_upstream_tries", "syntax": "uwsgi_next_upstream_tries number", "default": "uwsgi_next_upstream_tries 0", "context": "http, server, location" },
            { "directive": "uwsgi_no_cache", "syntax": "uwsgi_no_cache string ...", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_param", "syntax": "uwsgi_param parameter value [if_not_empty]", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_pass", "syntax": "uwsgi_pass [protocol://]address", "default": "---", "context": "location, if in location" },
            { "directive": "uwsgi_pass_header", "syntax": "uwsgi_pass_header field", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_pass_request_body", "syntax": "uwsgi_pass_request_body on | off", "default": "uwsgi_pass_request_body on", "context": "http, server, location" },
            { "directive": "uwsgi_pass_request_headers", "syntax": "uwsgi_pass_request_headers on | off", "default": "uwsgi_pass_request_headers on", "context": "http, server, location" },
            { "directive": "uwsgi_read_timeout", "syntax": "uwsgi_read_timeout time", "default": "uwsgi_read_timeout 60s", "context": "http, server, location" },
            { "directive": "uwsgi_request_buffering", "syntax": "uwsgi_request_buffering on | off", "default": "uwsgi_request_buffering on", "context": "http, server, location" },
            { "directive": "uwsgi_send_timeout", "syntax": "uwsgi_send_timeout time", "default": "uwsgi_send_timeout 60s", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_certificate", "syntax": "uwsgi_ssl_certificate file", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_certificate_key", "syntax": "uwsgi_ssl_certificate_key file", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_ciphers", "syntax": "uwsgi_ssl_ciphers ciphers", "default": "uwsgi_ssl_ciphers DEFAULT", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_crl", "syntax": "uwsgi_ssl_crl file", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_name", "syntax": "uwsgi_ssl_name name", "default": "uwsgi_ssl_name host from uwsgi_pass", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_password_file", "syntax": "uwsgi_ssl_password_file file", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_protocols", "syntax": "uwsgi_ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "uwsgi_ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_server_name", "syntax": "uwsgi_ssl_server_name on | off", "default": "uwsgi_ssl_server_name off", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_session_reuse", "syntax": "uwsgi_ssl_session_reuse on | off", "default": "uwsgi_ssl_session_reuse on", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_trusted_certificate", "syntax": "uwsgi_ssl_trusted_certificate file", "default": "---", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_verify", "syntax": "uwsgi_ssl_verify on | off", "default": "uwsgi_ssl_verify off", "context": "http, server, location" },
            { "directive": "uwsgi_ssl_verify_depth", "syntax": "uwsgi_ssl_verify_depth number", "default": "uwsgi_ssl_verify_depth 1", "context": "http, server, location" },
            { "directive": "uwsgi_store", "syntax": "uwsgi_store on | off | string", "default": "uwsgi_store off", "context": "http, server, location" },
            { "directive": "uwsgi_store_access", "syntax": "uwsgi_store_access users:permissions ...", "default": "uwsgi_store_access user:rw", "context": "http, server, location" },
            { "directive": "uwsgi_temp_file_write_size", "syntax": "uwsgi_temp_file_write_size size", "default": "uwsgi_temp_file_write_size 8k|16k", "context": "http, server, location" },
            { "directive": "uwsgi_temp_path", "syntax": "uwsgi_temp_path path [level1 [level2 [level3]]]", "default": "uwsgi_temp_path uwsgi_temp", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_v2_module.html",
        "variables": [],
        "directives": [{ "directive": "http2_chunk_size", "syntax": "http2_chunk_size size", "default": "http2_chunk_size 8k", "context": "http, server, location" },
            { "directive": "http2_body_preread_size", "syntax": "http2_body_preread_size size", "default": "http2_body_preread_size 64k", "context": "http, server" },
            { "directive": "http2_idle_timeout", "syntax": "http2_idle_timeout time", "default": "http2_idle_timeout 3m", "context": "http, server" },
            { "directive": "http2_max_concurrent_streams", "syntax": "http2_max_concurrent_streams number", "default": "http2_max_concurrent_streams 128", "context": "http, server" },
            { "directive": "http2_max_field_size", "syntax": "http2_max_field_size size", "default": "http2_max_field_size 4k", "context": "http, server" },
            { "directive": "http2_max_header_size", "syntax": "http2_max_header_size size", "default": "http2_max_header_size 16k", "context": "http, server" },
            { "directive": "http2_max_requests", "syntax": "http2_max_requests number", "default": "http2_max_requests 1000", "context": "http, server, location" },
            { "directive": "http2_recv_buffer_size", "syntax": "http2_recv_buffer_size size", "default": "http2_recv_buffer_size 256k", "context": "http" },
            { "directive": "http2_recv_timeout", "syntax": "http2_recv_timeout time", "default": "http2_recv_timeout 30s", "context": "http, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/http/ngx_http_xslt_module.html",
        "variables": [],
        "directives": [{ "directive": "xml_entities", "syntax": "xml_entities path", "default": "---", "context": "http, server, location" },
            { "directive": "xslt_last_modified", "syntax": "xslt_last_modified on | off", "default": "xslt_last_modified off", "context": "http, server, location" },
            { "directive": "xslt_param", "syntax": "xslt_param parameter value", "default": "---", "context": "http, server, location" },
            { "directive": "xslt_string_param", "syntax": "xslt_string_param parameter value", "default": "---", "context": "http, server, location" },
            { "directive": "xslt_stylesheet", "syntax": "xslt_stylesheet stylesheet [parameter=value ...]", "default": "---", "context": "location" },
            { "directive": "xslt_types", "syntax": "xslt_types mime-type ...", "default": "xslt_types text/xml", "context": "http, server, location" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_core_module.html",
        "variables": [],
        "directives": [{ "directive": "listen", "syntax": "listen address:port [ssl] [backlog=number] [rcvbuf=size] [sndbuf=size] [bind] [ipv6only=on|off] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]]", "default": "---", "context": "server" },
            { "directive": "mail", "syntax": "mail { ... }", "default": "---", "context": "main" },
            { "directive": "protocol", "syntax": "protocol   imap |  pop3 |  smtp", "default": "---", "context": "server" },
            { "directive": "resolver", "syntax": "resolver address ...[valid=time];resolver off", "default": "resolver off", "context": "mail, server" },
            { "directive": "resolver_timeout", "syntax": "resolver_timeout time", "default": "resolver_timeout 30s", "context": "mail, server" },
            { "directive": "server", "syntax": "server { ... }", "default": "---", "context": "mail" },
            { "directive": "server_name", "syntax": "server_name name", "default": "server_name hostname", "context": "mail, server" },
            { "directive": "timeout", "syntax": "timeout time", "default": "timeout 60s", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_auth_http_module.html",
        "variables": [],
        "directives": [{ "directive": "auth_http", "syntax": "auth_http URL", "default": "---", "context": "mail, server" },
            { "directive": "auth_http_header", "syntax": "auth_http_header header value", "default": "---", "context": "mail, server" },
            { "directive": "auth_http_pass_client_cert", "syntax": "auth_http_pass_client_cert on | off", "default": "auth_http_pass_client_cert off", "context": "mail, server" },
            { "directive": "auth_http_timeout", "syntax": "auth_http_timeout time", "default": "auth_http_timeout 60s", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_proxy_module.html",
        "variables": [],
        "directives": [{ "directive": "proxy_buffer", "syntax": "proxy_buffer size", "default": "proxy_buffer 4k|8k", "context": "mail, server" },
            { "directive": "proxy_pass_error_message", "syntax": "proxy_pass_error_message on | off", "default": "proxy_pass_error_message off", "context": "mail, server" },
            { "directive": "proxy_timeout", "syntax": "proxy_timeout timeout", "default": "proxy_timeout 24h", "context": "mail, server" },
            { "directive": "xclient", "syntax": "xclient on | off", "default": "xclient on", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_ssl_module.html",
        "variables": [],
        "directives": [{ "directive": "ssl", "syntax": "ssl on | off", "default": "ssl off", "context": "mail, server" },
            { "directive": "ssl_certificate", "syntax": "ssl_certificate file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_certificate_key", "syntax": "ssl_certificate_key file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_ciphers", "syntax": "ssl_ciphers ciphers", "default": "ssl_ciphers HIGH:!aNULL:!MD5", "context": "mail, server" },
            { "directive": "ssl_client_certificate", "syntax": "ssl_client_certificate file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_crl", "syntax": "ssl_crl file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_dhparam", "syntax": "ssl_dhparam file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_ecdh_curve", "syntax": "ssl_ecdh_curve curve", "default": "ssl_ecdh_curve auto", "context": "mail, server" },
            { "directive": "ssl_password_file", "syntax": "ssl_password_file file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_prefer_server_ciphers", "syntax": "ssl_prefer_server_ciphers on | off", "default": "ssl_prefer_server_ciphers off", "context": "mail, server" },
            { "directive": "ssl_protocols", "syntax": "ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "mail, server" },
            { "directive": "ssl_session_cache", "syntax": "ssl_session_cache off | none| [builtin[:size]] [shared:name:size]", "default": "ssl_session_cache none", "context": "mail, server" },
            { "directive": "ssl_session_ticket_key", "syntax": "ssl_session_ticket_key file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_session_tickets", "syntax": "ssl_session_tickets on | off", "default": "ssl_session_tickets on", "context": "mail, server" },
            { "directive": "ssl_session_timeout", "syntax": "ssl_session_timeout time", "default": "ssl_session_timeout 5m", "context": "mail, server" },
            { "directive": "ssl_trusted_certificate", "syntax": "ssl_trusted_certificate file", "default": "---", "context": "mail, server" },
            { "directive": "ssl_verify_client", "syntax": "ssl_verify_client on | off | optional | optional_no_ca", "default": "ssl_verify_client off", "context": "mail, server" },
            { "directive": "ssl_verify_depth", "syntax": "ssl_verify_depth number", "default": "ssl_verify_depth 1", "context": "mail, server" },
            { "directive": "starttls", "syntax": "starttls   on |  off |  only", "default": "starttls off", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_imap_module.html",
        "variables": [],
        "directives": [{ "directive": "imap_auth", "syntax": "imap_auth method ...", "default": "imap_auth plain", "context": "mail, server" },
            { "directive": "imap_capabilities", "syntax": "imap_capabilities extension ...", "default": "imap_capabilities IMAP4 IMAP4rev1 UIDPLUS", "context": "mail, server" },
            { "directive": "imap_client_buffer", "syntax": "imap_client_buffer size", "default": "imap_client_buffer 4k|8k", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_pop3_module.html",
        "variables": [],
        "directives": [{ "directive": "pop3_auth", "syntax": "pop3_auth method ...", "default": "pop3_auth plain", "context": "mail, server" },
            { "directive": "pop3_capabilities", "syntax": "pop3_capabilities extension ...", "default": "pop3_capabilities TOP USER UIDL", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/mail/ngx_mail_smtp_module.html",
        "variables": [],
        "directives": [{ "directive": "smtp_auth", "syntax": "smtp_auth method ...", "default": "smtp_auth login plain", "context": "mail, server" },
            { "directive": "smtp_capabilities", "syntax": "smtp_capabilities extension ...", "default": "---", "context": "mail, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_core_module.html",
        "variables": ["$binary_remote_addr", "$bytes_received", "$bytes_sent", "$connection", "$hostname", "$msec", "$nginx_version", "$pid", "$protocol", "$proxy_protocol_addr", "$proxy_protocol_port", "$remote_addr", "$remote_port", "$server_addr", "$server_port", "$session_time", "$status", "$time_iso8601", "$time_local"],
        "directives": [{ "directive": "listen", "syntax": "listen address:port [ssl] [udp] [proxy_protocol] [backlog=number] [rcvbuf=size] [sndbuf=size] [bind] [ipv6only=on|off] [reuseport] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]]", "default": "---", "context": "server" },
            { "directive": "preread_buffer_size", "syntax": "preread_buffer_size size", "default": "preread_buffer_size 16k", "context": "stream, server" },
            { "directive": "preread_timeout", "syntax": "preread_timeout timeout", "default": "preread_timeout 30s", "context": "stream, server" },
            { "directive": "proxy_protocol_timeout", "syntax": "proxy_protocol_timeout timeout", "default": "proxy_protocol_timeout 30s", "context": "stream, server" },
            { "directive": "resolver", "syntax": "resolver address ... [valid=time] [ipv6=on|off]", "default": "---", "context": "stream,server" },
            { "directive": "resolver_timeout", "syntax": "resolver_timeout time", "default": "resolver_timeout30s", "context": "stream, server" },
            { "directive": "server", "syntax": "server { ... }", "default": "---", "context": "stream" },
            { "directive": "stream", "syntax": "stream { ... }", "default": "---", "context": "main" },
            { "directive": "tcp_nodelay", "syntax": "tcp_nodelay on | off", "default": "tcp_nodelay on", "context": "stream, server" },
            { "directive": "variables_hash_bucket_size", "syntax": "variables_hash_bucket_size size", "default": "variables_hash_bucket_size 64", "context": "stream" },
            { "directive": "variables_hash_max_size", "syntax": "variables_hash_max_size size", "default": "variables_hash_max_size 1024", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_access_module.html",
        "variables": [],
        "directives": [{ "directive": "allow", "syntax": "allow address | CIDR | unix: | all", "default": "---", "context": "stream, server" },
            { "directive": "deny", "syntax": "deny address | CIDR | unix: | all", "default": "---", "context": "stream, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_geo_module.html",
        "variables": [],
        "directives": [{ "directive": "geo", "syntax": "geo [$address] $variable { ... }", "default": "---", "context": "stream" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_geoip_module.html",
        "variables": ["$geoip_country_code", "$geoip_country_code3", "$geoip_country_name", "$geoip_area_code", "$geoip_city_continent_code", "$geoip_city_country_code", "$geoip_city_country_code3", "$geoip_city_country_name", "$geoip_dma_code", "$geoip_latitude", "$geoip_longitude", "$geoip_region", "$geoip_region_name", "$geoip_city", "$geoip_postal_code", "$geoip_org"],
        "directives": [{ "directive": "geoip_country", "syntax": "geoip_country file", "default": "---", "context": "stream" },
            { "directive": "geoip_city", "syntax": "geoip_city file", "default": "---", "context": "stream" },
            { "directive": "geoip_org", "syntax": "geoip_org file", "default": "---", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_js_module.html",
        "variables": [],
        "directives": [{ "directive": "js_access", "syntax": "js_access function", "default": "---", "context": "stream,server" },
            { "directive": "js_filter", "syntax": "js_filter function", "default": "---", "context": "stream, server" },
            { "directive": "js_include", "syntax": "js_include file", "default": "---", "context": "stream" },
            { "directive": "js_preread", "syntax": "js_preread function", "default": "---", "context": "stream, server" },
            { "directive": "js_set", "syntax": "js_set $variable function", "default": "---", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_limit_conn_module.html",
        "variables": [],
        "directives": [{ "directive": "limit_conn", "syntax": "limit_conn zone number", "default": "---", "context": "stream, server" },
            { "directive": "limit_conn_log_level", "syntax": "limit_conn_log_level info |notice|warn |error", "default": "limit_conn_log_level error", "context": "stream, server" },
            { "directive": "limit_conn_zone", "syntax": "limit_conn_zone key zone=name:size", "default": "---", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_log_module.html",
        "variables": [],
        "directives": [{ "directive": "access_log", "syntax": "access_log path format [buffer=size] [gzip[=level]] [flush=time] [if=condition];access_log off", "default": "access_log off", "context": "stream, server" },
            { "directive": "log_format", "syntax": "log_format name [escape=default|json] string ...", "default": "---", "context": "stream" },
            { "directive": "open_log_file_cache", "syntax": "open_log_file_cache max=N[inactive=time][min_uses=N][valid=time];open_log_file_cache off", "default": "open_log_file_cache off", "context": "stream, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_map_module.html",
        "variables": [],
        "directives": [{ "directive": "map", "syntax": "map string $variable { ... }", "default": "---", "context": "stream" },
            { "directive": "map_hash_bucket_size", "syntax": "map_hash_bucket_size size", "default": "map_hash_bucket_size 32|64|128", "context": "stream" },
            { "directive": "map_hash_max_size", "syntax": "map_hash_max_size size", "default": "map_hash_max_size 2048", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_proxy_module.html",
        "variables": [],
        "directives": [{ "directive": "proxy_bind", "syntax": "proxy_bind address [transparent] | off", "default": "---", "context": "stream, server" },
            { "directive": "proxy_buffer_size", "syntax": "proxy_buffer_size size", "default": "proxy_buffer_size 16k", "context": "stream, server" },
            { "directive": "proxy_connect_timeout", "syntax": "proxy_connect_timeout time", "default": "proxy_connect_timeout 60s", "context": "stream, server" },
            { "directive": "proxy_download_rate", "syntax": "proxy_download_rate rate", "default": "proxy_download_rate 0", "context": "stream, server" },
            { "directive": "proxy_next_upstream", "syntax": "proxy_next_upstreamon | off", "default": "proxy_next_upstream on", "context": "stream, server" },
            { "directive": "proxy_next_upstream_timeout", "syntax": "proxy_next_upstream_timeout time", "default": "proxy_next_upstream_timeout 0", "context": "stream, server" },
            { "directive": "proxy_next_upstream_tries", "syntax": "proxy_next_upstream_triesnumber", "default": "proxy_next_upstream_tries 0", "context": "stream, server" },
            { "directive": "proxy_pass", "syntax": "proxy_pass address", "default": "---", "context": "server" },
            { "directive": "proxy_protocol", "syntax": "proxy_protocol on | off", "default": "proxy_protocol off", "context": "stream, server" },
            { "directive": "proxy_responses", "syntax": "proxy_responses number", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl", "syntax": "proxy_ssl on | off", "default": "proxy_ssl off", "context": "stream, server" },
            { "directive": "proxy_ssl_certificate", "syntax": "proxy_ssl_certificate file", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl_certificate_key", "syntax": "proxy_ssl_certificate_key file", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl_ciphers", "syntax": "proxy_ssl_ciphers ciphers", "default": "proxy_ssl_ciphers DEFAULT", "context": "stream, server" },
            { "directive": "proxy_ssl_crl", "syntax": "proxy_ssl_crl file", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl_name", "syntax": "proxy_ssl_name name", "default": "proxy_ssl_name host from proxy_pass", "context": "stream, server" },
            { "directive": "proxy_ssl_password_file", "syntax": "proxy_ssl_password_file file", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl_server_name", "syntax": "proxy_ssl_server_name on | off", "default": "proxy_ssl_server_name off", "context": "stream, server" },
            { "directive": "proxy_ssl_session_reuse", "syntax": "proxy_ssl_session_reuse on | off", "default": "proxy_ssl_session_reuse on", "context": "stream, server" },
            { "directive": "proxy_ssl_protocols", "syntax": "proxy_ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "proxy_ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "stream, server" },
            { "directive": "proxy_ssl_trusted_certificate", "syntax": "proxy_ssl_trusted_certificate file", "default": "---", "context": "stream, server" },
            { "directive": "proxy_ssl_verify", "syntax": "proxy_ssl_verify on | off", "default": "proxy_ssl_verify off", "context": "stream, server" },
            { "directive": "proxy_ssl_verify_depth", "syntax": "proxy_ssl_verify_depth number", "default": "proxy_ssl_verify_depth 1", "context": "stream, server" },
            { "directive": "proxy_timeout", "syntax": "proxy_timeout timeout", "default": "proxy_timeout 10m", "context": "stream, server" },
            { "directive": "proxy_upload_rate", "syntax": "proxy_upload_rate rate", "default": "proxy_upload_rate 0", "context": "stream, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_realip_module.html",
        "variables": ["$realip_remote_addr", "$realip_remote_port"],
        "directives": [{ "directive": "set_real_ip_from", "syntax": "set_real_ip_from address | CIDR | unix:", "default": "---", "context": "stream, server" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_return_module.html",
        "variables": [],
        "directives": [{ "directive": "return", "syntax": "return value", "default": "---", "context": "server" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_split_clients_module.html",
        "variables": [],
        "directives": [{ "directive": "split_clients", "syntax": "split_clients string $variable { ...}", "default": "---", "context": "stream" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_ssl_module.html",
        "variables": ["$ssl_cipher", "$ssl_ciphers", "$ssl_client_cert", "$ssl_client_fingerprint", "$ssl_client_i_dn", "$ssl_client_raw_cert", "$ssl_client_s_dn", "$ssl_client_serial", "$ssl_client_v_end", "$ssl_client_v_remain", "$ssl_client_v_start", "$ssl_client_verify", "$ssl_curves", "$ssl_protocol", "$ssl_server_name", "$ssl_session_id", "$ssl_session_reused"],
        "directives": [{ "directive": "ssl_certificate", "syntax": "ssl_certificate file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_certificate_key", "syntax": "ssl_certificate_key file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_ciphers", "syntax": "ssl_ciphers ciphers", "default": "ssl_ciphers HIGH:!aNULL:!MD5", "context": "stream, server" },
            { "directive": "ssl_client_certificate", "syntax": "ssl_client_certificate file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_crl", "syntax": "ssl_crl file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_dhparam", "syntax": "ssl_dhparam file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_ecdh_curve", "syntax": "ssl_ecdh_curve curve", "default": "ssl_ecdh_curve auto", "context": "stream, server" },
            { "directive": "ssl_handshake_timeout", "syntax": "ssl_handshake_timeout time", "default": "ssl_handshake_timeout 60s", "context": "stream, server" },
            { "directive": "ssl_password_file", "syntax": "ssl_password_file file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_prefer_server_ciphers", "syntax": "ssl_prefer_server_ciphers on | off", "default": "ssl_prefer_server_ciphers off", "context": "stream, server" },
            { "directive": "ssl_protocols", "syntax": "ssl_protocols [SSLv2] [SSLv3] [TLSv1] [TLSv1.1] [TLSv1.2] [TLSv1.3]", "default": "ssl_protocols TLSv1 TLSv1.1 TLSv1.2", "context": "stream, server" },
            { "directive": "ssl_session_cache", "syntax": "ssl_session_cache off | none | [builtin[:size]] [shared:name:size]", "default": "ssl_session_cache none", "context": "stream, server" },
            { "directive": "ssl_session_ticket_key", "syntax": "ssl_session_ticket_key file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_session_tickets", "syntax": "ssl_session_tickets on | off", "default": "ssl_session_tickets on", "context": "stream, server" },
            { "directive": "ssl_session_timeout", "syntax": "ssl_session_timeout time", "default": "ssl_session_timeout 5m", "context": "stream, server" },
            { "directive": "ssl_trusted_certificate", "syntax": "ssl_trusted_certificate file", "default": "---", "context": "stream, server" },
            { "directive": "ssl_verify_client", "syntax": "ssl_verify_client on | off | optional |optional_no_ca", "default": "ssl_verify_client off", "context": "stream, server" },
            { "directive": "ssl_verify_depth", "syntax": "ssl_verify_depth number", "default": "ssl_verify_depth 1", "context": "stream, server" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_ssl_preread_module.html",
        "variables": ["$ssl_preread_server_name"],
        "directives": [{ "directive": "ssl_preread", "syntax": "ssl_preread on | off", "default": "ssl_preread off", "context": "stream, server" }]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_upstream_module.html",
        "variables": ["$upstream_addr", "$upstream_bytes_sent", "$upstream_bytes_received", "$upstream_connect_time", "$upstream_first_byte_time", "$upstream_session_time"],
        "directives": [{ "directive": "upstream", "syntax": "upstream name { ... }", "default": "---", "context": "stream" },
            { "directive": "server", "syntax": "server address [parameters]", "default": "---", "context": "upstream" },
            { "directive": "zone", "syntax": "zone name [size]", "default": "---", "context": "upstream" },
            { "directive": "state", "syntax": "state file", "default": "---", "context": "upstream" },
            { "directive": "hash", "syntax": "hash key [consistent]", "default": "---", "context": "upstream" },
            { "directive": "least_conn", "syntax": "least_conn", "default": "---", "context": "upstream" },
            { "directive": "least_time", "syntax": "least_time connect | first_byte | last_byte [inflight]", "default": "---", "context": "upstream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/stream/ngx_stream_upstream_hc_module.html",
        "variables": [],
        "directives": [{ "directive": "health_check", "syntax": "health_check [parameters]", "default": "---", "context": "server" },
            { "directive": "health_check_timeout", "syntax": "health_check_timeout timeout", "default": "health_check_timeout 5s", "context": "stream, server" },
            { "directive": "match", "syntax": "match name  { ... }", "default": "---", "context": "stream" }
        ]
    }, {
        "pageUrlInfo": "http://nginx.org/en/docs/ngx_google_perftools_module.html",
        "variables": [],
        "directives": [{ "directive": "google_perftools_profiles", "syntax": "google_perftools_profiles file", "default": "---", "context": "main" }]
    }]

    // OptionSelect.InsertOptionSelect(options, res);
    for (var i = 0; i < allOptionInfo.length; i++) {
        var optinfo = allOptionInfo[i];
        optinfo._id = allOptionInfo[i].pageUrlInfo;
        OptionInfo.InsertOptionInfo(optinfo, res);
    }

};


// Create Base64 Object
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
        }
        return t;
    },
    decode: function(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r);
            }
            if (a != 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = Base64._utf8_decode(t);
        return t;
    },
    _utf8_encode: function(e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    },
    _utf8_decode: function(e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++;
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2;
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3;
            }
        }
        return t;
    }
};
