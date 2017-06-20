/* global module */
var db = require('./models/connectDB.js'),
    User = require('./models/user'),
    Ext = require('./models/ext.js'),
    OptionSelect = require('./models/optionselect.js'),
    ini = require('ini'),
    fs = require('fs'),
    md5 = require('md5'),
    btoa = require('btoa');

User = new User();
Ext = new Ext();
OptionSelect = new OptionSelect();

module.exports.configDB = function() {
    var self = this;
    User.InsertUser({
        email: "admin@admin.pt", //self.config.user,
        pass: md5(btoa("admin" /*self.config.pass*/ ))
    }, null, null);
    self.InsertAllExt(null, null);
    self.InsertAllOptionSelect(null, null);
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
        text: "Imagens",
        ext: ["jpg", "gif", "jpe?g", "png", "ico", "cur", "woff"]
    }, res);
    Ext.InsertExt({
        text: "Documentos",
        ext: ["pdf", "doc", "docx", "xls", "xlxs", "ppt", "pptx", "ttf", "otf", "eot", "svg"]
    }, res);
    Ext.InsertExt({
        text: "Conteudos HTML",
        ext: ["css", "js", "html", "xml", "htc"]
    }, res);
};

module.exports.getOptionsToPlace = function(req, res) {
    OptionSelect.getOptionsFromPlace({ context: new RegExp(req.params.place, "i") }, res);
};

module.exports.InsertAllOptionSelect = function(req, res) {
    var options = [
		{
			'directive': 'absolute_redirect',
			'context': 'http, server, location'
		},
		{
			'directive': 'aio',
			'context': 'http, server, location'
		},
		{
			'directive': 'aio_write',
			'context': 'http, server, location'
		},
		{
			'directive': 'alias',
			'context': 'location'
		},
		{
			'directive': 'chunked_transfer_encoding',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_body_buffer_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_body_in_file_only',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_body_in_single_buffer',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_body_temp_path',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_body_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'client_header_buffer_size',
			'context': 'http,server'
		},
		{
			'directive': 'client_header_timeout',
			'context': 'http,server'
		},
		{
			'directive': 'client_max_body_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'connection_pool_size',
			'context': 'http,server'
		},
		{
			'directive': 'default_type',
			'context': 'http, server, location'
		},
		{
			'directive': 'directio',
			'context': 'http, server, location'
		},
		{
			'directive': 'directio_alignment',
			'context': 'http, server, location'
		},
		{
			'directive': 'disable_symlinks',
			'context': 'http, server, location'
		},
		{
			'directive': 'error_page',
			'context': 'http, server, location'
		},
		{
			'directive': 'etag',
			'context': 'http, server, location'
		},
		{
			'directive': 'if_modified_since',
			'context': 'http, server, location'
		},
		{
			'directive': 'ignore_invalid_headers',
			'context': 'http,server'
		},
		{
			'directive': 'internal',
			'context': 'location'
		},
		{
			'directive': 'keepalive_disable',
			'context': 'http, server, location'
		},
		{
			'directive': 'keepalive_requests',
			'context': 'http, server, location'
		},
		{
			'directive': 'keepalive_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'large_client_header_buffers',
			'context': 'http,server'
		},
		{
			'directive': 'limit_except',
			'context': 'location'
		},
		{
			'directive': 'limit_rate',
			'context': 'http, server, location'
		},
		{
			'directive': 'limit_rate_after',
			'context': 'http, server, location'
		},
		{
			'directive': 'lingering_close',
			'context': 'http, server, location'
		},
		{
			'directive': 'lingering_time',
			'context': 'http, server, location'
		},
		{
			'directive': 'lingering_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'listen',
			'context': 'server'
		},
		{
			'directive': 'location',
			'context': 'server,location'
		},
		{
			'directive': 'log_not_found',
			'context': 'http, server, location'
		},
		{
			'directive': 'log_subrequest',
			'context': 'http, server, location'
		},
		{
			'directive': 'max_ranges',
			'context': 'http, server, location'
		},
		{
			'directive': 'merge_slashes',
			'context': 'http, server'
		},
		{
			'directive': 'msie_padding',
			'context': 'http, server, location'
		},
		{
			'directive': 'msie_refresh',
			'context': 'http, server, location'
		},
		{
			'directive': 'open_file_cache',
			'context': 'http, server, location'
		},
		{
			'directive': 'open_file_cache_errors',
			'context': 'http, server, location'
		},
		{
			'directive': 'open_file_cache_min_uses',
			'context': 'http, server, location'
		},
		{
			'directive': 'open_file_cache_valid',
			'context': 'http, server, location'
		},
		{
			'directive': 'output_buffers',
			'context': 'http, server, location'
		},
		{
			'directive': 'port_in_redirect',
			'context': 'http, server, location'
		},
		{
			'directive': 'postpone_output',
			'context': 'http, server, location'
		},
		{
			'directive': 'read_ahead',
			'context': 'http, server, location'
		},
		{
			'directive': 'recursive_error_pages',
			'context': 'http, server, location'
		},
		{
			'directive': 'request_pool_size',
			'context': 'http, server'
		},
		{
			'directive': 'reset_timedout_connection',
			'context': 'http, server, location'
		},
		{
			'directive': 'resolver',
			'context': 'http, server, location'
		},
		{
			'directive': 'resolver_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'root',
			'context': 'http, server, location'
		},
		{
			'directive': 'satisfy',
			'context': 'http, server, location'
		},
		{
			'directive': 'send_lowat',
			'context': 'http, server, location'
		},
		{
			'directive': 'send_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'sendfile',
			'context': 'http, server, location'
		},
		{
			'directive': 'sendfile_max_chunk',
			'context': 'http, server, location'
		},
		{
			'directive': 'server_name',
			'context': 'http, server, location'
		},
		{
			'directive': 'server_name_in_redirect',
			'context': 'http, server, location'
		},
		{
			'directive': 'server_tokens',
			'context': 'http, server, location'
		},
		{
			'directive': 'tcp_nodelay',
			'context': 'http, server, location'
		},
		{
			'directive': 'tcp_nopush',
			'context': 'http, server, location'
		},
		{
			'directive': 'try_files',
			'context': 'server, location'
		},
		{
			'directive': 'types',
			'context': 'http, server, location'
		},
		{
			'directive': 'types_hash_bucket_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'types_hash_max_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'underscores_in_headers',
			'context': 'http, server'
		},
		{
			'directive': 'server',
			'context': 'upstream'
		},
		{
			'directive': 'zone',
			'context': 'upstream'
		},
		{
			'directive': 'state',
			'context': 'upstream'
		},
		{
			'directive': 'hash',
			'context': 'upstream'
		},
		{
			'directive': 'ip_hash',
			'context': 'upstream'
		},
		{
			'directive': 'keepalive',
			'context': 'upstream'
		},
		{
			'directive': 'ntlm',
			'context': 'upstream'
		},
		{
			'directive': 'least_conn',
			'context': 'upstream'
		},
		{
			'directive': 'least_time',
			'context': 'upstream'
		},
		{
			'directive': 'queue',
			'context': 'upstream'
		},
		{
			'directive': 'sticky',
			'context': 'upstream'
		},
		{
			'directive': 'sticky_cookie_insert',
			'context': 'upstream'
		},
		{
			'directive': 'proxy_bind',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_buffer_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_buffering',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_buffers',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_busy_buffers_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_background_update',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_bypass',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_convert_head',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_key',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_lock',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_lock_age',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_lock',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_lock_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_max_range_offset',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_methods',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_min_uses',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_path',
			'context': 'http'
		},
		{
			'directive': 'proxy_cache_purge',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_revalidate',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_use_stale',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cache_valid',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_connect_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cookie_domain',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_cookie_path',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_force_ranges',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_headers_hash_bucket_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_headers_hash_max_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_hide_header',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_http_version',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ignore_client_abort',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ignore_headers',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_intercept_errors',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_limit_rate',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_max_temp_file_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_method',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_next_upstream',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_next_upstream_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_next_upstream_tries',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_no_cache',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_pass',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_pass_header',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_pass_request_body',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_pass_request_headers',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_read_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_redirect',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_request_buffering',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_send_lowat',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_send_timeout',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_set_body',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_set_header',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_certificate',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_certificate_key',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_ciphers',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_crl',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_name',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_password_file',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_server_name',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_session_reuse',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_protocols',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_trusted_certificate',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_verify',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_ssl_verify_depth',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_store',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_store_access',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_temp_file_write_size',
			'context': 'http, server, location'
		},
		{
			'directive': 'proxy_temp_path',
			'context': 'http, server, location'
		}
	];
  for(var i = 0; i< options.length;i++){
    OptionSelect.InsertOptionSelect(options[i], res);
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
