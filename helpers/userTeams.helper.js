/*
 #*===================================================================
 #*
 #* Licensed Materials - Property of IBM
 #* IBM Cloud Brokerage
 #* Copyright IBM Corporation 2017. All Rights Reserved.
 #*
 #*===================================================================
 */

/**
 * Helper methods for User Teams Testing
 */

"use strict";

var userAuthAPI = require('./APIs/userAuthAPI.js');

var UserTeamsHelper = function() {

    this.checkUserTeams = function(){
        var teamsFromUI = [];
        var teamsFromAPI = [];
        
        return new Promise((resolve, reject) => {
            userAuthAPI.getUserTeams().then(function(data) {       
            teamsFromAPI = userAuthAPI.extractTeams(data);
            console.log("Teams from API: " + teamsFromAPI);
        
            element(by.css('#user.user-info')).getAttribute('title').then(title => {
                teamsFromUI = title.split('\u000A');
                console.log("Teams from UI: " + teamsFromUI );
                if(teamsFromUI.includes(teamsFromAPI[0])){
                    console.log("The team is found: " + teamsFromAPI[0]);
                    resolve(true);
                }
            });
            });
        });

    }    

}

module.exports = UserTeamsHelper;