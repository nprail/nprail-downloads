function parse(version) {
    function isNumeric(n) {
        return /\d/.test(n);
    }
    if (!isNumeric(version)) {
        return false;
    }
    let versions = version.split('.');
    let versionsPre

    let output = {
        major: versions[0],
        minor: versions[1],
    }

    // if there is NOT a patch number
    if (versions[2] === undefined) {
        versionsPre = versions[1].split('-');
        output.minor = versionsPre[0];

        // check if it is a pre-release
        if (versions[1].indexOf('-') > -1) {
            output.prePrefix = versionsPre[1].replace(/\d+$/, "");
            output.preNum = versionsPre[1].replace(/\D/g, '');
        }
    }
    // if there is a patch number
    else {
        versionsPre = versions[2].split('-');
        output.patch = versionsPre[0];

        // check if it is a pre-release
        if (versions[2].indexOf('-') > -1) {
            output.prePrefix = versionsPre[1].replace(/\d+$/, "");
            output.preNum = versionsPre[1].replace(/\D/g, '');
        }
    }

    return output;
};

module.exports = parse;