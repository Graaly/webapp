import { parseInt } from "core-js/fn/number";

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
        AppRate.promptForRating();
    },
    initLocalStorage() {
        if (window.localStorage.getItem("alreadyAsked") == null) {
            window.localStorage.setItem("alreadyAsked", false);
        }
    },
    addAlreadyAskedForRating() {
        window.localStorage.setItem("alreadyAsked", true);
    },
    hasAlreadyHavePopup() {
        return window.localStorage.getItem("alreadyAsked");
    }
    // /**
    //  * Initalisation of the start value counter
    //  */
    // initLaunhCounter() {
    //     if (window.localStorage.getItem("startupNumber") == null) {
    //         //initialise the local storage
    //         console.log("initial launch");
    //         window.localStorage.setItem("startupNumber", 0);
    //     }
    //     else {
    //         console.log("Startup Counter alterdy initialised, adding launch")
    //         this.addlaunch();
    //         if (this.getNumberOfLaunches() === 3) {
    //             console.log("launching popop to rate the app");
    //             this.launchpopup();
    //         }
    //     }
    // },
    // /**
    //  * Returns he current value of the launch number
    //  */
    // getNumberOfLaunches() {
    //     var curentvalue = window.localStorage.getItem("startupNumber");
    //     console.log("get nb launch");
    //     console.log(curentvalue);
    //     return curentvalue;
    // },
    // /**
    //  * Add one to the launch counter
    //  */
    // addlaunch() {
    //     var curentvalue = window.localStorage.getItem("startupNumber");
    //     curentvalue = parseInt(curentvalue);
    //     window.localStorage.setItem("startupNumber", curentvalue + 1);
    // }
}