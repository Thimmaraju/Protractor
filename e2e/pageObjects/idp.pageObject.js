var extend = require('extend');

var defaultConfig = {

    url : "https://adfs.fieldengg.local/adfs/ls/idpinitiatedsignon",
    homepageSiginButton : "idp_SignInButton",
    usernameTextField : "userNameInput",
    passwordTextField : "passwordInput",
    SigninSubmitButton : "submitButton",
    FinalSigninButton : "idp_GoButton"
};

function idp(selectorConfig) {
    if (!(this instanceof idp)) {
        return new idp(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

idp.prototype.clickhomepageSignin = function() {
    return element(by.id(this.homepageSiginButton)).click();
};

idp.prototype.clickSigninSubmit = function() {
    return element(by.id(this.SigninSubmitButton)).click();
};

idp.prototype.clickFinalSigninButton = function() {
    return element(by.id(this.FinalSigninButton)).click();
};

idp.prototype.enterUsername = function(username) {
    return element(by.id(this.usernameTextField)).sendKeys(username);
};

idp.prototype.enterPassowrd = function(password) {
    return element(by.id(this.passwordTextField)).sendKeys(password);
};

module.exports = idp;