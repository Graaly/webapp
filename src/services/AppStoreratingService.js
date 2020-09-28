//https://github.com/pushandplay/cordova-plugin-apprate

export default {
    /**
     * Launch the rating popup
     */
    launchpopup() {
        var _this = this;
        AppRate.preferences.useLanguage = 'fr';
        AppRate.preferences.storeAppURL = {
            ios: 'id1448284225',
            android: 'market://details?id=graaly.app'
        };
        AppRate.preferences.reviewType = {
            ios: 'InAppReview',
            android: 'InAppReview'
        };
        AppRate.preferences.simpleMode = true;
        AppRate.preferences.callbacks.onButtonClicked = function (buttonIndex) {
            console.log("onButtonClicked -> " + buttonIndex);
            switch (buttonIndex) {
                case 1:
                    // no, don't remind me again
                    _this.addAlreadyAskedForRating();
                    break;
                case 2:
                    // yes but remind me later
                    _this.addLater(7) // 7 here is the number of days to ask him later
                    break;
                case 3:
                    // rate now
                    break;
                default:
                    break;
            }
        };
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
        if (window.localStorage.getItem("futuredate") === null) {
            window.localStorage.setItem("futuredate", "");
        }
    },
    /**
     * Added to the local storage the fact that we have asked him
     */
    addAlreadyAskedForRating() {
        window.localStorage.setItem("alreadyAsked", "true");
    },
    /**
     * Add in the database the fact that the user wants to be reminded later on
     * @param {*} days in how many days should we re remind him ? 
     */
    addLater(days) {
        var today = new Date();
        var future = new Date();
        future.setDate(today.getDate() + days); //create the future date 
        window.localStorage.setItem("alreadyAsked", "later");
        window.localStorage.setItem("futuredate", future.toString());
    },
    /**
     * Return the value of the local storage if we have already asked the user 
     * to rate
     */
    hasAlreadyHavePopup() {
        var already = window.localStorage.getItem("alreadyAsked")
        if (already === "true" || already === "false") {
            console.log("has already awensered")
            return already;
        }
        else if (already === "later") {
            //awwensered to do it later
            var storedDate = window.localStorage.getItem("futuredate")
            //If the stored date is before the current date
            if (new Date(storedDate) < new Date()) {
                //we are passed the store date, send popup
                return "false";
            }
            else {
                //we are NOT passed the storedate, DO NOT send popup
                return "true";
            }
        }
    },
    /**
     * /!\ DEBUG ONLY /!\
     * Reset the value of already ask to false 
     * (will pop up at the next startup)
     */
    resetAlreadyAsked() {
        window.localStorage.setItem("alreadyAsked", "false");
        window.localStorage.setItem("futuredate", "");
    }
}