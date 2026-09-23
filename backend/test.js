const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cluster0.1j7qyuw.mongodb.net", (err, records) => {
    if (err) {
        console.log("ERROR:");
        console.log(err);
    } else {
        console.log(records);
    }
});