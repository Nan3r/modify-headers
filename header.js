var HEADER_SWITCH_LIST = "header_switch_list";
var PRESET_SWITCH_LIST = "preset_switch_list";
var HEADER_STATS_MAP = "header_stats";
var DOMAIN_STATS_MAP = "domain_stats";
var availableHeaders = ["Accept", "Accept-Charset", "Accept-Encoding", "Accept-Language", "Authorization", "Cache-Control", "Connection", "Cookie", "Content-Length", "Content-MD5", "Content-Type", "Date", "Expect", "From", "Host", "If-Match", "If-Modified-Since", "If-None-Match", "If-Range", "If-Unmodified-Since", "Max-Forwards", "Pragma", "Proxy-Authorization", "Range", "Referer", "TE", "Upgrade", "User-Agent", "Via", "Warning", "X-Requested-With", "X-Do-Not-Track", "DNT", "X-Forwarded-For", "X-ATT-DeviceId", "X-Wap-Profile"];
var prohibitedHeaders = ["Authorization", "Cache-Control", "Connection", "Content-Length", "If-Modified-Since", "If-None-Match", "If-Range", "Partial-Data", "Pragma", "Proxy-Authorization", "Proxy-Connection", "Transfer-Encoding"];
var hotlist_indices = [];

function HeaderSwitch() {
    this.title = "";
    this.header = "";
    this.string = "";
    this.append = false;
    this.regex = "";
    this.serialize = function () {
        return JSON.stringify(this)
    };
    this.deserialize = function (a) {
        return this.copyFromMap(JSON.parse(a))
    };
    this.copyFromMap = function (a) {
        this.title = a.title;
        this.header = a.header;
        this.string = a.string;
        this.append = a.append;
        this.regex = a.regex;
        return this
    };
    this.getPopupDisplayString = function () {
        if (this.title && this.title != "") {
            return this.title + " (" + (this.append ? "Append to " : "Replace ") + this.header + ")" + (this.regex ? " on " + this.regex : "")
        }
        return this.header + (this.append ? ": Append " : ": Change to ") + this.string + (this.regex ? " on " + this.regex : "")
    }
}

function PresetSwitch(b, a) {
    this.domain = b;
    this.header_switch = a;
    this.copyFromMap = function (c) {
        this.domain = c.domain;
        this.header_switch = new HeaderSwitch().copyFromMap(c.header_switch);
        return this
    }
}

function HeaderUsage() {
    this.stats = {};
    this.domains = {};
    this.header_switches = {};
    this.request_types = {};
    this.serialize = function () {
        return JSON.stringify(this)
    };
    this.deserialize = function (a) {
        return this.copyFromMap(JSON.parse(a))
    };
    this.copyFromMap = function (a) {
        this.stats = a.stats;
        this.domains = a.domains;
        this.header_switches = a.header_switches;
        this.request_types = a.request_types;
        return this
    };
    this.addUsage = function (c, a, b) {
        this.domains[b] = ((this.domains[b]) ? this.domains[b] : 0) + 1;
        this.request_types[a] = ((this.request_types[a]) ? this.request_types[a] : 0) + 1;
        this.header_switches[getSwitchIdentifier(c)] = ((this.header_switches[getSwitchIdentifier(c)]) ? this.header_switches[getSwitchIdentifier(c)] : 0) + 1;
        var d = this.hashString(c, a, b);
        this.stats[d] = ((this.stats[d]) ? this.stats[d] : 0) + 1
    };
    this.hashString = function (c, a, b) {
        return b + " " + a + " " + getSwitchIdentifier(c)
    }
}

function getSwitchIdentifier(a) {
    if (a.title && a.title != "") {
        return a.title + " (" + (a.append ? "Append to " : "Replace ") + a.header + ")"
    }
    return a.header + (a.append ? ": Append " : ": Change to ") + a.string
}

function getParsedItem(b) {
    try {
        return JSON.parse(localStorage.getItem(b))
    } catch (a) {}
    return null
}

function storeItem(a, b) {
    if (!b) {
        b = ""
    }
    localStorage.setItem(a, JSON.stringify(b))
}

function findHostname(c) {
    var b = document.createElement("a");
    b.href = c;
    return b.host
}

function getSwitchList() {
    var c = getParsedItem(HEADER_SWITCH_LIST);
    var b = [];
    if (c) {
        for (var a = 0; a < c.length; a++) {
            b.push(new HeaderSwitch().copyFromMap(c[a]))
        }
    }
    return b
}

function setSwitchList(c) {
    var b = [];
    if (c) {
        for (var a = 0; a < c.length; a++) {
            b.push(c[a].serialize())
        }
    }
    storeItem(HEADER_SWITCH_LIST, c)
}

function getHeaderUsage() {
    var a = getParsedItem(HEADER_STATS_MAP);
    return (a ? new HeaderUsage().copyFromMap(a) : new HeaderUsage())
}

function setHeaderUsage(a) {
    storeItem(HEADER_STATS_MAP, a)
}

function getPresetSwitchList() {
    var c = getParsedItem(PRESET_SWITCH_LIST);
    var b = [];
    if (c) {
        for (var a = 0; a < c.length; a++) {
            b.push(new PresetSwitch().copyFromMap(c[a]))
        }
    }
    return b
}

function setPresetSwitchList(a) {
    storeItem(PRESET_SWITCH_LIST, a)
}

function addHeaderSwitchOption(f, g, c, a, d) {
    var b = new HeaderSwitch();
    b.title = f;
    b.header = g;
    b.string = c;
    b.append = a;
    b.regex = d;
    var e = getSwitchList();
    e.push(b);
    setSwitchList(e)
}

function addPresetSwitch(c, b) {
    var d = new PresetSwitch(c, b);
    var a = getPresetSwitchList();
    a.push(d);
    setPresetSwitchList(a)
}

function deleteHeaderSwitchOption(a) {
    var b = getSwitchList();
    if (b && a >= 0 && a < b.length) {
        b.splice(a, 1);
        removeIndexFromHotlist(a)
    }
    setSwitchList(b)
}

function deletePresetSwitch(a) {
    var b = getPresetSwitchList();
    if (b && a >= 0 && a < b.length) {
        b.splice(a, 1)
    }
    setPresetSwitchList(b)
}

function toggleHotlistIndex(a) {
    var b = hotlist_indices.indexOf(a);
    if (b == -1) {
        hotlist_indices.push(a)
    } else {
        hotlist_indices.splice(b, 1)
    }
}

function removeIndexFromHotlist(a) {
    var b = hotlist_indices.indexOf(a);
    if (b > -1) {
        hotlist_indices.splice(b, 1)
    }
}

function recordHeaderUse(d, c, a) {
    var b = getHeaderUsage();
    b.addUsage(d, a, c);
    setHeaderUsage(b)
}

function getSortedMap(d, c) {
    var b = [];
    for (var a in d) {
        b.push([a, d[a]])
    }
    b.sort(function (f, e) {
        f = f[1];
        e = e[1];
        return (c ? (f < e ? -1 : (f > e ? 1 : 0)) : (f < e ? 1 : (f > e ? -1 : 0)))
    });
    return b
}

function getRandomNumber(a) {
    if (!a) {
        a = 999999999999999
    }
    return Math.round(a * Math.random())
}

function getRandomUserAgent(){
	var b = [
		'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)',
		'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2)',
		'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
		'Mozilla/4.0 (compatible; MSIE 5.0; Windows NT)',
		'Mozilla/5.0 (Windows; U; Windows NT 5.2) Gecko/2008070208 Firefox/3.0.1',
		'Mozilla/5.0 (Windows; U; Windows NT 5.1) Gecko/20070309 Firefox/2.0.0.3',
		'Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/525.13 (KHTML, like Gecko) Version/3.1 Safari/525.13',
		'Mozilla/5.0 (iPhone; U; CPU like Mac OS X) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/4A93 Safari/419.3',
		'Opera/9.27 (Windows NT 5.2; U; zh-cn)',
		'Opera/8.0 (Macintosh; PPC Mac OS X; U; en)',
		'Mozilla/5.0 (Macintosh; PPC Mac OS X; U; en) Opera 8.0 ',
		'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19',
		'Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
		'Mozilla/5.0 (Windows NT 6.2; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0',
		'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
		'Mozilla/5.0 (Linux; Android 4.1.2; Nexus 7 Build/JZ054K) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Safari/535.19',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; SAMSUNG; SGH-i917)',
		'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)',
		'Mozilla/5.0 (iPad; CPU OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3',
		'Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3A101a Safari/419.3',
		'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML, like Gecko) Version/7.2.1.0 Safari/536.2+',
		'Mozilla/5.0 (MeeGo; NokiaN9) AppleWebKit/534.13 (KHTML, like Gecko) NokiaBrowser/8.5.0 Mobile Safari/534.13'
	]
	
	return b[Math.floor(Math.random() * b.length)]
}

function getRandomString(d) {
    if (!d) {
        d = 10 + getRandomNumber(40)
    }
    var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var e = "";
    for (var b = 0; b < d; b++) {
        var a = Math.floor(Math.random() * c.length);
        e += c.substring(a, a + 1)
    }
    return e
}

function getRandomIPAddress() {
    return "" + getRandomNumber(255) + "." + getRandomNumber(255) + "." + getRandomNumber(255) + "." + getRandomNumber(255)
}

function replaceRandoms(a) {
    if (!a) {
        return ""
    }
    a = a.replace(/\$RANDOM_NUMBER/g, getRandomNumber());
    a = a.replace(/\$RANDOM_STRING/g, getRandomString());
    a = a.replace(/\$RANDOM_IP/g, getRandomIPAddress());
	a = a.replace(/\$RANDOM_UA/g, getRandomUserAgent());
    return a
}

function replaceVariables(a, b) {
    if (!b) {
        return ""
    }
    b = b.replace(/\$HOSTNAME/g, findHostname(a));
    return replaceRandoms(b)
};