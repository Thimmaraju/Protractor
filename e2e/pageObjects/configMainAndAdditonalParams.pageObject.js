"use strict";

var extend = require('extend');

var url = browser.params.url;

var util = require('../../helpers/util.js');

var EC = protractor.ExpectedConditions;

var defaultConfig = {
    pageUrl:                      		url + '/storeFront/main',
    bluePrintTitleCss:              	'#card-title-2',
    configureButtonCss:             	'#button-storefront_carbon-button_configure',
    bluePrintTitleFromToolTipId:       'service-name_tooltip-content_',
    bluePrintPriceFromToolTipId:        'service-price_tooltip-content_',

    //css & xpath locators for additional paramaters for softlayer baremetal monthly service label/input/dropdowns/radio buttons

    //css/xpath locators for main parameters page

    requiredNotRequiredValueInput:      {0:'Not Required',1:'Required'},

    serviceName	:						'carbon-text-input#main_params-serviceName label',
    serviceNameInput	:				'#text-input-main_params-serviceName',
    team	:							'bx--dropdown-single-parent_team:' ,
    teamSelect	:						"//*[@id='bx--dropdown-single-parent_team:']/li[2]/ul/carbon-dropdown-option/li/a",
    teamSelection:                       {0:'TEAM1',1:'DEV'},
    buttonCancel:						'Cancel',
    buttonNext:                			'Next',
    buttonPrevious:		 				'Previous',
    validationTextCSS:                  'div.bx--form-requirement',
    allTextOnMainParamsCSS:              'main',
    applicationDropDownCSS:              'bx--dropdown-single-parent_application:',
    applicationValueInput:                {0:'All Applications', 1:'None'},
    applicationValue:                     ".//*[@id='bx--dropdown-single-parent_application:']/li[@class='bx--dropdown-text']",
    environmentDropDownCSS:               'bx--dropdown-single-parent_environment:',
    environmentValueInput:                 {0:'All Environments', 1:'None'},
    environmentValue:                      ".//*[@id='bx--dropdown-single-parent_environment:']/li[@class='bx--dropdown-text']",

    //Instance Details Page

    hostNameLbl: 			    		 '//label[contains(.,\'HostName\')]',
    hostNameInputBoxLocator:		     'input#text-input-hostname',
    hostNameValueInput:                  'hostname',

    domainLbl: 			    			 '//label[contains(.,\'Domain\')]',
    domainInputBoxLocator: 		    	 'input#text-input-domain',
    domainValueInput:                    'domain',

    datacenterLbl:              		 '//label[contains(.,\'Datacenter\')]',
    datacenterDropdown:                  'bx--dropdown-single-parent_datacenter',
    datacenterValue:                      ".//*[@id='bx--dropdown-single-parent_datacenter']/li[@class='bx--dropdown-text']",
    datacenterValueInput:                 {0:'Dallas 9', 1:'Dallas 10'},

    machineConfigurationLbl:    		 '//label[contains(.,\'Machine Configuration\')]',
    machineConfigurationDropdown:		 'bx--dropdown-single-parent_machine-configuration',
    machineConfigurationValue:           './/*[@id=\'bx--dropdown-single-parent_machine-configuration\']/li[@class=\'bx--dropdown-text\']',
    machineConfigValueInput:             {0:'SINGLE_E31270_2_DRIVES', 1:'BI.S1.NW32 (OS Options)'},

    //System Specifications Page

    operatingSystemLbl:         		 '//label[contains(.,\'Operating System\')]',
    operatingSystemDropdown: 			 'bx--dropdown-single-parent_operating-system',
    operatingSystemValue:               ".//*[@id='bx--dropdown-single-parent_operating-system']/li[@class='bx--dropdown-text']",
    operatingSystemValueInput:           {0:'OS_WINDOWS_2012_FULL_DC_64_BIT', 1:'Windows Server 2012 R2 Standard Edition (64 bit)',2:'Windows Server 2016 Standard Edition (64 bit)'},

    processorLbl:				 		 '//label[contains(.,\'Processor\')]',
    processorDropdown: 					 'bx--dropdown-single-parent_processor',
    processorValue:                      ".//*[@id='bx--dropdown-single-parent_processor']/li[@class='bx--dropdown-text']",
    processorValueInput:                 {0:'INTEL_SINGLE_XEON_1270_3_40', 1:'Single Intel Xeon E3-1270 v3 (4 Cores, 3.50 GHz)'},

    rAMgBLbl: 							 '//label[contains(.,\'RAM (GB)\')]',
    rAMgBDropdown:		   				 'bx--dropdown-single-parent_ram-(gb)',
    rAMgBValue:                          ".//*[@id='bx--dropdown-single-parent_ram-(gb)']/li[@class='bx--dropdown-text']",
    rAMgBValueInput:                     {0:'2' , 1:'32 GB RAM'},

    firstDiskLbl: 						  '//label[contains(.,\'First Disk\')]',
    firstDiskDropdown:					 'bx--dropdown-single-parent_first-disk',
    firstDiskValue:                       ".//*[@id='bx--dropdown-single-parent_first-disk']/li[@class='bx--dropdown-text']",
    firstDiskValueInput:                  {0:"HARD_DRIVE_500_GB_SATA",1:'2.00 TB SATA'},

    secondDiskLbl: 						 '//label[contains(.,\'Second Disk\')]',
    secondDiskDropdown: 				 'bx--dropdown-single-parent_second-disk',
    secondDiskValue:                     ".//*[@id='bx--dropdown-single-parent_second-disk']/li[@class='bx--dropdown-text']",
    secondDiskValueInput:                 {0:'HARD_DRIVE_500GB_SATA_II', 1:'4.00 TB SATA',2:'1.2 TB SSD (10 DWPD)'},

    //Network Details Page

    privateVlanIdLbl:		 	 		 '//label[contains(.,\'Private Vlan Id\')]',
    privateVlanIdDropdown: 				 'bx--dropdown-single-parent_private-vlan-id',
    privateVlanIdValue:                  ".//*[@id='bx--dropdown-single-parent_private-vlan-id']/li[@class='bx--dropdown-text']",
    privateVlanIdValueInput:             {0:'1494775',1:'2235511',2:'1328365',3:'2263777'},

    privateSubnetLbl: 				   	 '//label[contains(.,\'Private Subnet\')]',
    privateSubnetDropdown:			     'bx--dropdown-single-parent_private-subnet',
    privateSubnetValue:                  ".//*[@id='bx--dropdown-single-parent_private-subnet']/li[@class='bx--dropdown-text']",
    privateSubnetValueInput:             {0:'10.143.223.0/26',1:'10.93.142.192/26',2:'10.153.65.64/26',3:'10.153.73.64/26'},

    networkTypeLbl:              		 '//label[contains(.,\'Network Type\')]',
    networkTypeDropdown:                  'bx--dropdown-single-parent_network-type',
    networkTypeValue:                     ".//*[@id='bx--dropdown-single-parent_network-type']/li[@class='bx--dropdown-text']",
    networkTypeValueInput:                {0:'Private Network Only',1:'Private and Public Network'},

    bandwidthGBLbl:                    	 '//label[contains(.,\'Bandwidth (GB)\')]',
    bandwidthGBDropdown:	             'bx--dropdown-single-parent_bandwidth-(gb)',
    bandwidthGValue:                      ".//*[@id='bx--dropdown-single-parent_bandwidth-(gb)']/li[@class='bx--dropdown-text']",
    bandwidthGValueInputPNonly:           '0 GB Bandwidth',
    bandwidthGValueInputPNandPB:          '500 GB Bandwidth',

    publicVlanIdLbl: 					  '//label[contains(.,\'Public Vlan Id\')]',
    publicVlanIdDropdown:   			 'bx--dropdown-single-parent_public-vlan-id',
    publicVlanIdValue:                   ".//*[@id='bx--dropdown-single-parent_public-vlan-id']/li[@class='bx--dropdown-text']",
    publicVlanIdValueInput:              {0:'1328363',1:'1494763',2:'2263775'},

    publicSubnetLbl:				      '//label[contains(.,\'Public Subnet\')]',
    publicSubnetDropdown:	 			  'bx--dropdown-single-parent_public-subnet',
    publicSubnetValue:                    ".//*[@id='bx--dropdown-single-parent_public-subnet']/li[@class='bx--dropdown-text']",
    publicSubnetValueInput:               {0:'169.45.173.96/27',1:'10.93.142.192/26',2:'169.55.242.64/27',3:'169.45.129.176/28'},

    unbondedNetworkLbl:                 '//label[contains(.,\'Unbonded Network\')]',
    unbondedNetworkDropdown:            'bx--dropdown-single-parent_unbonded-network',
    unbondedNetworkValue:               ".//*[@id='bx--dropdown-single-parent_unbonded-network']/li[@class='bx--dropdown-text']",

    redundantNetworkLbl:                '//label[contains(.,\'Redundant Network\')]',
    redundantNetworkDropdown:           'bx--dropdown-single-parent_redundant-network',
    redundantNetworkValue:              ".//*[@id='bx--dropdown-single-parent_redundant-network']/li[@class='bx--dropdown-text']",

    restrictedNetworkLbl:                '//label[contains(.,\'Restricted Network\')]',
    restrictedNetworkDropdown:            'bx--dropdown-single-parent_restricted-network',
    restrictedNetworkValue:               ".//*[@id='bx--dropdown-single-parent_restricted-network']/li[@class='bx--dropdown-text']",

    networkSpeedMbpsLbl:       		     '//label[contains(.,\'Network Speed(Mbps)\')]',
    networkSpeedMbpsDropdown: 			 'bx--dropdown-single-parent_network-speed(mbps)',
    networkSpeedMbpsValue:               ".//*[@id='bx--dropdown-single-parent_network-speed(mbps)']/li[@class='bx--dropdown-text']",
    networkSpeedMbpsValueInput:           {0:'1000', 1:'1 Gbps Private Network Uplink',2:'100 Mbps Dual Public & Private Network Uplinks (Unbonded)'},


    //Other Details Page

    SshKeyIdsLbl: 					     '//label[contains(.,\'Ssh Key Ids\')]',
    SshKeyIdsDropdown:			         'bx--dropdown-single-parent_ssh-key-ids',
    SshKeyIdsValue:                      ".//*[@id='bx--dropdown-single-parent_ssh-key-ids']/li[@class='bx--dropdown-text']",
    SshKeyIdsValueInput:                 {0:'1039069',1:'655533'},

    metaDataLbl: 						  '//label[@for=\'text-inputuser_metadata\']',
    metadataInputBoxLocator:			  'input#text-input-user_metadata',
    metadataValueInput:                   'metadata',

    postInstallScriptLbl: 				  '//label[contains(.,\'Post Install Script\')]',
    postInstallScriptInputBoxLocator: 	  'input#text-input-post_install_script_uri',
    postInstallScriptValueInput:          'postinstallscript',

    tagsLbl: 						      '//label[@for=\'text-inputtags\']',
    tagsInputBoxLocator:			      'input#text-input-tags',
    tagsValueInput:                       'tags',

    //Extra details page

    publicSecondaryIPAddressesLbl:        '//label[contains(.,\'Public Secondary IP Addresses\')]',
    publicSecondaryIPAddressesDropdown:	  'bx--dropdown-single-parent_public-secondary-ip-addresses',
    publicSecondaryIPAddressesValue:       ".//*[@id='bx--dropdown-single-parent_public-secondary-ip-addresses']/li[@class='bx--dropdown-text']",
    publicSecondaryIPAddressesValueInput:   {0:'4 Public IP Addresses',1:'8 Public IP Addresses'},

    primaryIPv6AddressesLbl: 			  '//label[contains(.,\'Primary IPv6 Addresses\')]',
    primaryIPv6AddressesDropdown:		  'bx--dropdown-single-parent_primary-ipv6-addresses',
    primaryIPv6AddressesValue:            ".//*[@id='bx--dropdown-single-parent_primary-ipv6-addresses']/li[@class='bx--dropdown-text']",
    primaryIPv6AddressesValueInput:       {0:'1 IPv6 Address'},

    publicStaticIPv6AddressesLbl: 		  '//label[contains(.,\'Public Static IPv6 Addresses\')]',
    publicStaticIPv6AddressesDropdown:	  'bx--dropdown-single-parent_public-static-ipv6-addresses',
    publicStaticIPv6AddressesValue:       ".//*[@id='bx--dropdown-single-parent_public-static-ipv6-addresses']/li[@class='bx--dropdown-text']",
    publicStaticIPv6AddressesValueInput:  {0:'/64 Block Static Public IPv6 Addresses',1:'None'},

    redundantPowerSupplyLbl: 			 '//label[contains(.,\'Redundant power supply\')]',
    redundantPowerSupplyDropdown:		 'bx--dropdown-single-parent_redundant-power-supply',
    redundantPowerSupplyValue:           ".//*[@id='bx--dropdown-single-parent_redundant-power-supply']/li[@class='bx--dropdown-text']",

    graphicsProcessingUnitLbl: 			 '//label[contains(.,\'Graphics Processing Unit\')]',
    graphicsProcessingUnitDropdown:		 'bx--dropdown-single-parent_graphics-processing-unit',
    graphicsProcessingUnitValue:          ".//*[@id='bx--dropdown-single-parent_graphics-processing-unit']/li[@class='bx--dropdown-text']",
    graphicsProcessingUnitValueInput:    {0:'NVIDIA Tesla P100 Graphic Card'},

    secondaryGraphicsProcessingUnitLbl: 	 '//label[contains(.,\'Secondary Graphics Processing Unit\')]',
    secondaryGraphicsProcessingUnitDropdown: 'bx--dropdown-single-parent_secondary-graphics-processing-unit',
    secondaryGraphicsProcessingUnitValue:    ".//*[@id='bx--dropdown-single-parent_secondary-graphics-processing-unit']/li[@class='bx--dropdown-text']",
    secondaryGraphicsProcessingUnitValueInput:'1039069'


};

function configMainAndAdditonalParams(selectorConfig) {
    if (!(this instanceof configMainAndAdditonalParams)) {
        return new configMainAndAdditonalParams(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
};


configMainAndAdditonalParams.prototype.open = function()
{
    browser.get(this.pageUrl);
};


configMainAndAdditonalParams.prototype.selectDropDownValueBasedOnFieldName = function(labelID,value) {
    var elem = element(by.css("[id='"+labelID+"']"));
    browser.wait(EC.elementToBeClickable(elem), 10000);
    return elem.click().then(function(){
        var elem1 = element(by.xpath("//*[@id='"+labelID+"'] //a[text()[normalize-space()='"+value+"']]"));
        browser.wait(EC.elementToBeClickable(elem1), 10000);
        elem1.click();
    });
};



configMainAndAdditonalParams.prototype.getSelectedValueFromDropdown = function(xpathValue) {
    return new Promise(
        (resolve, reject) => {
            element(by.xpath(xpathValue)).getAttribute('innerText').then(function (text) {
                console.log("Selected value in the drop down field on additional parameter page is : " + text);
                resolve(text);
            });
        });
};

configMainAndAdditonalParams.prototype.getValidationMessageOnPage = function () {

    browser.sleep(2000);
    return element(by.css(this.validationTextCSS)).getText().then(function (text) {
        console.log('Validation Text displayed on UI page :' + text);
        return (text);
    });
}

configMainAndAdditonalParams.prototype.getAllDisplayedTextOnPage = function () {

    browser.sleep(2000);
    return element(by.css(this.allTextOnMainParamsCSS)).getText().then(function (text) {
        return (text);
    });
}

configMainAndAdditonalParams.prototype.selectRadioOption = function(cssPath) {
    element(by.xpath(cssPath)).click();
};

configMainAndAdditonalParams.prototype.getSelectedRadioOption = function(cssPath) {
    return new Promise(
        (resolve, reject) => {
            element(by.css(cssPath)).getAttribute('innerText').then(function (text) {
                console.log("Radio option selected on additional parameter page is :  " + text);
                resolve(text);
            });
        });
};


configMainAndAdditonalParams.prototype.sendKeysToInputField_And_GetValue = function(cssPath,inputValueToken) {

    return new Promise(
        (resolve, reject) => {
            element(by.css(cssPath)).sendKeys(inputValueToken + util.getRandomString(5));
            browser.sleep('3000');
            element(by.css(cssPath)).getAttribute('value').then(function (text) {
                console.log("promise - User Entered value on the page is :  " + text);
                resolve(text);
            });
        }
    );

};

configMainAndAdditonalParams.prototype.sendKeysWithRandomCharToInputField_And_GetValue = function(randomChar,cssPath,inputValueToken) {

    return new Promise(
        (resolve, reject) => {
            element(by.css(cssPath)).sendKeys(inputValueToken + util.getRandomString(5));
            browser.sleep('3000');
            element(by.css(cssPath)).getAttribute('value').then(function (text) {
                console.log("Random Character Used: " + randomChar);
                console.log("promise - User Entered value on the page is :  " + text);
                resolve(text);
            });
        }
    );

};

configMainAndAdditonalParams.prototype.sendKeysToInputWithRandomCharAtEnd_And_GetValue = function(randomChar,cssPath,inputValueToken) {

    return new Promise(
        (resolve, reject) => {
            element(by.css(cssPath)).sendKeys(inputValueToken);
            browser.sleep('3000');
            element(by.css(cssPath)).getAttribute('value').then(function (text) {
                console.log("Random Character Used at End: " + randomChar);
                console.log("promise - User Entered value on the page is :  " + text);
                resolve(text);
            });
        }
    );

};


//-----Function to click next Button on  Main parameters and Additional Parameters
configMainAndAdditonalParams.prototype.clickNext = function()
{
    element(by.buttonText(this.buttonNext)).click();
    util.waitForAngular();
};

//--------Function to click on previous button on  Additional Parameters and Review Order
configMainAndAdditonalParams.prototype.clickPrevious = function()
{
    element(by.buttonText(this.buttonPrevious)).click();
    util.waitForAngular();
};

module.exports = configMainAndAdditonalParams;
