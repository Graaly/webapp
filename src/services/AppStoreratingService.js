export default {
    /**
     * Launch the rating popup
     */
    launchpopup() {
        //https://github.com/pushandplay/cordova-plugin-apprate

        AppRate.preferences.storeAppURL = {
            ios: 'id1448284225  ',
            android: 'market://details?id=graaly.app'
        };

        AppRate.preferences.useLanguage = 'fr';
        AppRate.preferences.callbacks = {
            handleNegativeFeedback: function () {
                window.open('mailto:contact@graaly.com', '_system');
            },
           /* onRateDialogShow: function (callback) {
                callback(1) // cause immediate click on 'Rate Now' button
            },*/
            onButtonClicked: function (buttonIndex) {
                console.log("onButtonClicked -> " + buttonIndex);
            }
        }
        AppRate.promptForRating();
    },
    /**
     * Initialise the local storage to keep in mind if we have already
     * asked the user or not to rate the application
     */
    initLocalStorage() {
        if (window.localStorage.getItem("alreadyAsked") === null) {
            //Locale storage only stores strings, not booleans
            window.localStorage.setItem("alreadyAsked", "false");
        }
    },
    /**
     * Added to the local storage the fact taht we have asked him
     */
    addAlreadyAskedForRating() {
        window.localStorage.setItem("alreadyAsked", true);
    },
    /**
     * Return the value of the local storage if we have already asked the user 
     * to rate
     */
    hasAlreadyHavePopup() {
        if (window.localStorage.getItem("alreadyAsked") === null) {
            this.initLocalStorage();
            return "false";
        }
        else {
            return window.localStorage.getItem("alreadyAsked");
        }
    },
    /**
     * Reset the value of already ask to false 
     * (will pop up at the next startup)
     */
    resetAlreadyAsked() {
        window.localStorage.setItem("alreadyAsked", "false");
    }
}