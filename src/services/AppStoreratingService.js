//https://github.com/pushandplay/cordova-plugin-apprate

export default {
    /**
     * Launch the rating popup
     */
    launchpopup() {
        var _this = this;
        AppRate.preferences.useLanguage = 'fr';
        AppRate.preferences.storeAppURL = {
            ios: 'id1448284225  ',
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
                case 1: //no
                    _this.addAlreadyAskedForRating();
                    break;
                case 2: //later
                    _this.addAlreadyAskedForRating(7);
                    break;
                case 3: //nows
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
           // window.localStorage.setItem("futuredate", "")
        }
    },
    /**
     * Added to the local storage the fact taht we have asked him
     */
    addAlreadyAskedForRating(days) {
        window.localStorage.setItem("alreadyAsked", "true");
      /*  if (days === null) {
            window.localStorage.setItem("alreadyAsked", "true");
        }
        else {
            var future = new Date();
            future.setDate(new Date().getDate() + 7);
            console.log(future);
            window.localStorage.setItem("alreadyAsked", "true");
            window.localStorage.setItem("futuredate", future.toDateString());
        }*/
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
        /*else if (window.localStorage.getItem("futuredate") !== "") {
            var futureDate = new Date(window.localStorage.getItem("futuredate"));
            console.log(futureDate + "   ");
            if (futureDate > new Date()) {
                //we are pas the date, we need toa ska again
                return false;
            }
        }
        else {
            return window.localStorage.getItem("alreadyAsked");
        }*/
    },
    /**
     * Reset the value of already ask to false 
     * (will pop up at the next startup)
     */
    resetAlreadyAsked() {
        window.localStorage.setItem("alreadyAsked", "false");
    // window.localStorage.setItem("futuredate", "");
    }
}