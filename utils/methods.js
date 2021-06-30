
/* method for email validation */
exports.validateEmail = function (email) {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(email) == false) {
        return false;
    }
    return true;
}

/* method for pincode validation */
exports.validatePincode = function (pincode) {
    let reg = /^(\d{4}|\d{6})$/;
    if (reg.test(pincode) == false) {
        return false;
    }
    return true;
}

/* method for pincode validation */
exports.validateMobileNumber = function (mobileNumber) {
    let reg = /^[0-9]{10}$/;
    if (reg.test(mobileNumber) == false) {
        return false;
    }
    return true;
}