"use strict";

var extend = require('extend');
var url = browser.params.url;
var util = require('../../helpers/util.js'); 
var logGenerator = require("../../helpers/logGenerator.js"),
	logger = logGenerator.getApplicationLogger();
var EC = protractor.ExpectedConditions;
var flag = false;
var isVM = false;
var actstatus = "";
var retFunc = false;

var defaultConfig = {
		
	//***********LOCATORS FOR Inventory tab ***********
	pageUrl:                      				url + '/inventory',
	inventoryTabXpath:                            '//a[contains(text(), "INVENTORY")]',
	
	//***********LOCATORS FOR FILTERS***********
    
    filtersIconXpath:        					'(//*[@class="bx--toolbar__menu__icon"])[1]',
    filterCheckBoxesLabelCss:					'[id^=checkbox-overflow-menu-checkbox] ~ label',
    filterCheckBoxesCss:						'[id^=checkbox-overflow-menu-checkbox]',
    filterProviderNamesCss:						'[id^="inventory-data-table-0-tool-bar-filterByProvider"] > fieldset > carbon-overflow-menu-checkbox > li > carbon-checkbox > div > label',
    filtersNoDataTextXpath:   					'(//tbody/tr/td/div/h4/strong)',
    
  //***********LOCATORS FOR PAGINATION***********
    
    numberOfPagesTextCss:                  		'.bx--pagination__text>span',
    firstitemPerPageCss:						'.bx--select-option',
    seconditemPerPageCss:						'#bx--pagination-0__select-option-25',
    thirditemPerPageCss:						'#bx--pagination-0__select-option-50',
    paginationRightArrowXpath:             		'(//*[@class="bx--pagination__button bx--pagination__button--forward"])',
    paginationLeftArrowXpath:              		'(//*[@class="bx--pagination__button bx--pagination__button--backward"])',
    overflowmenuoptionsXpath:              		'(//*[@class="bx--overflow-menu-options__option"][5])',
    
  //*****************LOCATORS FOR SORT**************

    instanceNameColumnNameCss:					'#carbon-deluxe-data-table-0-top-header-instance-name-col-1',
    statusCoulmnNameCss:						'#carbon-deluxe-data-table-0-top-header-status-col-2',
    provisionedDateColumnNameCss:				'#carbon-deluxe-data-table-0-top-header-provisioned-date-col-3',
    providerColumnNameCss:						'#carbon-deluxe-data-table-0-top-header-provider-col-4',
    providerAccountColumnNameCss:				'#carbon-deluxe-data-table-0-top-header-provider-account-col-5',
    soiSourceColumnNameCss:						'#carbon-deluxe-data-table-0-top-header-soi-source-col-6',
    teamColumnNameCss:							'#carbon-deluxe-data-table-0-top-header-team-col-7',
    orderedByColumnNameCss:						'#carbon-deluxe-data-table-0-top-header-ordered-by-col-8',
    serviceNameColumnNameCss:					'#carbon-deluxe-data-table-0-top-header-service-offering-name-col-9',
    estimatedCostColumnNameCss:					'#carbon-deluxe-data-table-0-top-header-estimated-cost-col-10',
    currencyColumnNameCss:						'#carbon-deluxe-data-table-0-top-header-currency-col-11',
    applicationColumnNameCss:					'#carbon-deluxe-data-table-0-top-header-application-col-12',
    environmentColumnNameCss:					'#carbon-deluxe-data-table-0-top-header-environment-col-13',
    viewingColumnRightArrowCss:					'#carbon-deluxe-data-table-0-table-scroller__right',
    	
    instanceNameColumnXpath:					'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][1]',
    statusColumnXpath:							'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][2]',
    provisionedDateColumnXpath:					'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][3]',
    providerColumnXpath:						'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][4]',
    providerAccountColumnXpath:					'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][5]',
    teamColumnXpath:							'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][6]',
    orderedByColumnXpath:						'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][7]',
    serviceNameColumnXpath:						'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][8]',
    estimatedCostColumnXpath:					'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][9]',
    currencyColumnXpath:						'//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][10]',
    connectVMInstructionXpath:                     '(//*[@class="bx--modal-header__heading"])',
    	
	
	//***********LOCATORS FOR SEARCH***********
    
    searchIconCss:                            	'#bx--tool-bar--search-icon',
    searchTextBoxCss:						  	'.bx--search-input',
	
	// Locators for Instance Table
	instanceTableActionIconCss :                 '.bx--table-overflow',
	instanceTableFirstDeleteButtonCss:           '#carbon-deluxe-data-table-0-parent-row-1-option-3-button',
	
	//***********LOCATORS FOR Edit Service***********
	buttonTextEditService:						'Edit Service',
	editServiceNextButtonCss:					'#button-next-button-mainParams',
	editServiceNextButtonAdditionalParamsCss:	'#button-next-button-additionalParams',
	editCancelButtonCss:						'#button-cancel-button-mainParams',
	editCPUDropDownCss:							'#bx--dropdown-single-parent_1',
	editCPUDropDownValue2Css:					'#dropdown-option_1_2',
	editServiceBillOfMaterialsCss:				'#non-one-time-charge',
	editCPUInputCss:							'#text-input-1',
	editMoreLinkCss:							'.review-order_more-link>a',
	editCurrentBOMButtonCss:					'#current_bom',
	editUpdatedBOMButtonCss:					'#updated_bom',
	editstrikedCPUTextCss:						'.strike',
	editupdatedTagTextCss:						'.tag>span',
	editCurrentCPUTextCss:						'.two-columns.m-padding>li>span>span',
	editSubmitOrderButtonCss:					'#button-submit-button-reviewOrder',
	editOrderNumberCss:							'#order-number',
	editGoToInventoryButtonCss:					'#button-order-submitted-editmodal_carbon-button',
	editInProgressStatusTextXpath:				'.//*[@id="carbon-deluxe-data-table-3"]/tbody/tr/td[4]/div/div[1]/div',
		
	//****LOCATORS FOR Delete Service****
	deleteserviceCss:							'#carbon-deluxe-data-table-0-parent-row-1-option-3-button',
	deleteservicecheckboxCss:					'.bx--checkbox-label',
	deleteserviceOkayCss:						'#button-inventory-listing_action-modal_carbon-button_ok',
    deleteserviceCancelCss:						'#button-inventory-listing_action-modal_carbon-button_cancel',
	//deleteOrderNumberFromPopUpTextCss:		'#invemtory-listing_carbon-notification_delete-service-order-number',
	deleteOrderNumberFromPopUpTextCss:			'#inventory-listing_carbon-notification_delete-service-import-id',
    buttonTextDeleteService:					'Delete Service',
    buttonTextAddRecordSet:				'Add Record Set',	
	
	//**** Locators for Delete Service Modal****

	deleteServiceModalOKButtonCss:               '#button-inventory-listing_action-modal_carbon-button_ok',
	deleteServiceModalCancelButtonCss:           '#button-inventory-listing_action-modal_carbon-button_cancel',
	deleteServiceModalCloseXButtonCss:           '#close-btn_action-modal',
	deleteServiceModalConfirmCheckBoxCss:		 '#checkbox-inventory-listing_action-modal_ConfirmDeleteServiceChecked ~ .bx--checkbox-label',
	deleteServiceModalNotificationBoxCss:		 '.bx--modal-container',
	deleteServiceModalNotificationBoxCloseCss:	 '#close-btn_action-modal',
	deleteServiceModalNotificationBoxTextCss:	 '.bx--modal-content>div>div',
	deleteOrderSubmittedModalOrderDateTextCss:   '.bx--modal-content>div>div',
	deleteOrderSubmittedModalOrderNumberTextCss: '.bx--modal-content>div>div',
     
	//***********LOCATORS FOR Inventory table***********
    inventoryTopHeaderTextCss:					'#top-header-inventory_service-inventory',
    inventoryTableCheckboxListCss:    			'.bx--checkbox-appearance',
    
    //***********LOCATORS FOR IMPORT BUTTON***********
    
    importIconCss:                            	'#button-importFile',
    uploadFileIconXpath:                        '(//*[@class="bx--file-btn bx--btn bx--btn--secondary"])',
    
   //***********LOCATORS FOR Viewing Columns***********
    viewingColumnsRightArrowCss:				'#carbon-deluxe-data-table-0-table-scroller__right',
    viewingColumnsLeftArrowCss:					'#carbon-deluxe-data-table-0-table-scroller__left',
  
    paginationRightArrowCss:					'#bx--pagination__forward-button-0',
    paginationLeftArrowCss:						'#bx--pagination__back-button-0',
    noDataAvailableTextCss:						'.bx--table-row-placeholder__background-fill>h4>strong',
    itemsPerPageTextCss:						'.bx--pagination__text > span',
    firstrowAccordianXpath:						'(//*[@class="bx--responsive-table"]/tbody/tr[1]/td[1])',
    viewingColumnScrollArrowsDisabledXpath:		'(//*[@class="bx--table-scroll bx--table-scroll--disabled"])',
    menuIconXpath:                                 '(//*[@class="bx--overflow-menu__icon"])[3]',
    
    //***********LOCATORS FOR View Service***********	
 	selectedSOIGlificonCss:						'.bx--table-overflow',
 	//viewServiceCss:								'.bx--overflow-menu-options__option',
 	viewServiceButtonText:						'View Service',
 	serviceNameOfSelectedSOICss:				'[class^=bx--module__title]',
 	providerServiceInstanceIdXpath:				'//*[@id="left"]/p[2]',
 	sliderCloseIconCss:							'.bx--slide-over-panel-header > carbon-icon > svg',
	addRecordsetOverflowMenuIconXpath:     			'(//*[@class="bx--overflow-menu__icon"])',
	addRecordSetXpath:					'Add Record Set',

    	 
     //***********LOCATORS FOR SERVICE ID ***********
     //Duplicate declaration from above lines 64 and 65.
     //searchIconCss:        				'#bx--tool-bar--search-icon',
     //searchTextBoxCss:					'.bx--search-input',
     GlificonIconXpath:					    '(//*[@class="bx--overflow-menu__icon"])[2]',
//     viewserviceXpath:						'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     viewserviceXpath:						'.//*[@id="carbon-deluxe-data-table-0-parent-row-1-option-1-button"]',
     orderhistoryCss:						'#order_history',
     viewservicecloseXpath:				    '(//*[@class="bx--btn bx--btn--primary"])[2]',
     refreshserviceXpath:					'.//*[@id="carbon-deluxe-data-table-0-parent-row-1-option-3-button"]',
     refreshserviceOkayCss:				    '#button-inventory-listing_action-modal_carbon-button_ok',
     
     editserviceCss:						'#carbon-deluxe-data-table-0-parent-row-1-option-2-button',
     turnOffserviceOkayCss:				    '#button-inventory-listing_action-modal_carbon-button_ok',
     turnOnserviceOkayCss:				    '#button-inventory-listing_action-modal_carbon-button_ok',
     rebootserviceOkayCss:				    '#button-inventory-listing_action-modal_carbon-button_ok',
     refreshStatusOkayCss:				    '#button-inventory-listing_action-modal_carbon-button_ok',
     clickOptionsMenuXpath:                 '//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-2-overflow-menu-icon"]',
     machineNameValueXpath:                 '//*[(@class="bx--text-input") and (@type="Machine Name")]',
     
     refreshStatusDialogConfirmTextXpath:	'.//*[@id="inventory-listing_action-modal"]/div/div/div[2]/div/div',
     soiStatusXpath:						'.//*[@id="carbon-deluxe-data-table-0"]/tbody/tr/td[4]/div/div[2]',
     refreshStatusOkXpath:					'.//*[@id="button-inventory-listing_action-modal_carbon-button_ok"]',
     viewComponentSliderCloseButtonCss:		'.bx--slide-over-panel-header >carbon-icon > svg',
     socStatusFirstXpath:					'.//*[@id="_subId0"]/tbody/tr[1]/td[5]/div/div[2]',
     socStatusSecondXpath:					'.//*[@id="_subId0"]/tbody/tr[2]/td[5]/div/div[2]',
     
     //***********LOCATORS FOR ASSET ID ***********
     
     expandIconXpath:						'(//*[@class="bx--table-expand__svg"])',
     
     //***********LOCATORS FOR MENUS OPTIONS ***********
     
     refreshStatusXpath:					'(//*[@class="bx--overflow-menu-options__btn"])[2]',
     batchActionsMenuGlifficonXpath:		'(//*[@class="bx--overflow-menu"])[1]',
     SOIcheckboxXpath:						'.//*[@id="carbon-deluxe-data-table-0"]/tbody/tr[1]/td[2]/carbon-checkbox/div/label/span',
     batchActionsMenuDeleteSelectedXpath:	'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     batchActionsMenuRefreshStatusesXpath:	'(//*[@class="bx--overflow-menu-options__btn"])[2]',
     batchActionsMenuSOCTurnOnXpath:		'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     batchActionsMenuSOCTurnOffXpath:		'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     batchActionsMenuSOCRebootXpath:		'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     batchActionsMenuSOCRefreshXpath:		'(//*[@class="bx--overflow-menu-options__btn"])[1]',
     turnOnActionMenuOptionXpath:			'(//*[@class="bx--overflow-menu-options__btn"])[4]',
     turnOffActionMenuOptionXpath:			'(//*[@class="bx--overflow-menu-options__btn"])[5]',
     RebootActionMenuOptionXpath:			'(//*[@class="bx--overflow-menu-options__btn"])[6]',
     refreshStatusActionMenuOptionXpath:	'(//*[@class="bx--overflow-menu-options__btn"])[7]',
     viewComponentActionMenuOptionXpath:	'(//*[@class="bx--overflow-menu-options__btn"])[8]',
     accessComponentActionMenuOptionXpath:	'(//*[@class="bx--overflow-menu-options__btn"])[9]',
     turnOnActionMenuOptionCss:				'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-1-button',
     turnOffActionMenuOptionCss:			'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-2-button',
     
     RebootActionMenuFirstOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-6-button',
     RebootActionMenuSecondOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-2-option-6-button',
     turnOffActionMenuFirstOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-5-button',
     turnOffActionMenuSecondOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-2-option-5-button',
     turnOnActionMenuFirstOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-4-button',
     turnOnActionMenuSecondOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-2-option-4-button',
     refreshStatusActionMenuOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-1-button',
     viewComponentActionMenuOptionCss:		'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-3-button',
     accessComponentActionMenuOptionCss:	'#carbon-deluxe-data-table-0-parent-row-1-child-row-1-option-2-button',
     
     expandFirstRowXpath:					'(//*[@class="bx--table-expand__svg"])[1]',
     GlificonIconOfSOCXpath:				'//*[@id="carbon-deluxe-data-table-0"]/tbody/tr[3]/td[8]/carbon-overflow-menu/div',
     ViewComponentCloseButtonXpath:			'//carbon-slide-over-panel[2]/div/header/carbon-button/button',
     sOCFirstChildComponentXpath:			'//*[@id="carbon-deluxe-data-table-0"]/tbody/tr[3]/td[2]/carbon-checkbox/div/label/span',
   	 sOCSecondChildComponentXpath:			'//*[@id="carbon-deluxe-data-table-0"]/tbody/tr[4]/td[2]/carbon-checkbox/div/label/span',
   	 powerStateOverflowMenuIconXpath:       '(//*[@class="bx--overflow-menu__icon"])[3]',
   	 buttonTextTurnON:						'Turn ON',
	 turnONInstanceOkButtonCss:				'#button-inventory-listing_action-modal_carbon-button_ok',
	 buttonTextTurnOFF:						'Turn OFF',
	 turnOFFInstanceOkButtonCss:			'#button-inventory-listing_action-modal_carbon-button_ok',	
	 buttonTextReboot:						'Reboot',
	 rebootInstanceOkButtonCss:				'#button-inventory-listing_action-modal_carbon-button_ok',		
	 statusInstancePowerStateXpath:		     '(//*[@class="bx--table-column" and ../@class="bx--table-row bx--parent-row bx--table-row--sub-row bx--parent-row--even"])[3]',
	 buttonTextViewComponent:                 'View Component',
	//***********LOCATORS FOR View Components ***********
	 
   	componentTypePropXpath:					'//*[@id="left"]/p[1]',
   	namePropXpath:							'//*[@id="left"]/p[2]',
   	statusPropXpath:						'//*[@id="left"]/p[3]',
   	providerNamePropXpath:					'//*[@id="left"]/p[4]',
   	resourceIdPropXpath:					'//*[@id="left"]/p[5]',
   	tagsPropXpath:							'//*[@id="left"]/p[6]',
   	availabilityZonePropXpath:				'(.//*[@id="Template"])[1]',
   	availableIpAddressCountPropXpath:		'(.//*[@id="Template"])[2]',
   	cidrBlockPropXpath:						'(.//*[@id="Template"])[3]',
   	defaultForAzPropXpath:					'(.//*[@id="Template"])[4]',
    mapPublicIpOnLaunchPropXpath:					'(.//*[@id="Template"])[5]',
    statePropXpath:							'(.//*[@id="Template"])[6]',
    subnetIdPropXpath:						'(.//*[@id="Template"])[7]',
    vpcIdPropXpath:							'(.//*[@id="Template"])[8]',
    assignIpv6aAddressOnCreationPropXpath:	'(.//*[@id="Template"])[1]',
    ipv6CidrBlockAssociationSetPropXpath:	'(.//*[@id="Template"])[1]',
    deleteServiceInfoTooltipCss:			'#inventory-listing_carbon-notification',
    deleteOrderNumberCss:					'#inventory-listing_carbon-notification_delete-service-import-id',
    serviceInstanceNameXpath:				'.//*[@id="left"]/p[3]',
    cpuConfigXpath:							'.//*[@id="service_configurations_1_value"]',
    deleteServiceInfoTooltipXpath:			'//*[@class="bx--toast-notification bx--toast-notification--success bx--toast-notification-show"]',
    deleteOrderNumberXpath:					'//*[@class="bx--toast-notification bx--toast-notification--success bx--toast-notification-show"]//p[@id="inventory-listing_carbon-notification_delete-service-import-id"]',
    
    //*****************LOCATORS FOR ORDER HISTORY COLUMNS**************
    orderIdColumnNameXpath:					'(//*[@class="bx--table-header bx--table-sort"])[1]',
    operationTypeColumnNameXpath:				'(//*[@class="bx--table-header bx--table-sort"])[2]',
    statusColumnNameXpath:						'(//*[@class="bx--table-header bx--table-sort"])[3]',
    requestedByColumnNameXpath:				'(//*[@class="bx--table-header bx--table-sort"])[4]',
    estimatedcostcurrencyColumnNameXpath:		'(//*[@class="bx--table-header bx--table-sort"])[5]',
    errorFailureColumnNameXpath:				'(//*[@class="bx--table-header bx--table-sort"])[6]',
    selectInputXpath:        					'(//*[@class="bx--select-input"])',
    //********************d2ops bvt************************************
    socFirstChildGlificonXpath:					'.//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-1-overflow-menu-icon"]',
    socSecondChildGlificonXpath:				'.//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-2-overflow-menu-icon"]',
    componentTypeXpath:							'.//*[@id="_subId0"]/tbody/tr/td[4]/div/div[2]',
    
  //******************User menu********************
    userIconCss:							'.bx--cloud-header-list__btn.bx--toolbar__menu__icon',
    accountsMenuItemCss:					'#accountsSubMenuButton',
  
    //****************Azure VM Operation Locators**********************
    azurePowerStateOverflowMenuIconXpath:       '//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-7-overflow-menu-icon"]',
    azTurnOFFXpath:                             '//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-7-option-5-button"]',
    azTurnONXpath:                              '//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-7-option-4-button"]',
    azRebootXpath:                              '//*[@id="carbon-deluxe-data-table-0-parent-row-1-child-row-7-option-6-button"]',
    azVMStatus:                                 './/*[@id="_subId0"]/tbody/tr[7]/td[5]/div/div[2]',
    buttonTextNext:                			'Next'
    
}

function inventory(selectorConfig) {
    if (!(this instanceof inventory)) {
        return new inventory(selectorConfig);
    }
    extend(this, defaultConfig);

    if (selectorConfig) {
        extend(this, selectorConfig);
    }
}

inventory.prototype.open = function()
{
   browser.get(this.pageUrl);
   util.waitForAngular();
};

//************************ Functions for Filters ******************* //

inventory.prototype.clickFilterIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.filtersIconXpath))), 5000);
   	return element(by.xpath(this.filtersIconXpath)).click();
};

//This function is used to get the index of filter checkbox label based on passed filter name
inventory.prototype.getIndexofFilter = function(filterName){
	browser.wait(EC.visibilityOf(element(by.css(this.filterCheckBoxesLabelCss))),5000);
	return element.all(by.css(this.filterCheckBoxesLabelCss)).getText().then(function(arr){
		for (var i=0;i<arr.length;i++)
			if (arr[i] == filterName)
	            return i;
	  	})
};

//This function is used to get click the status or providers checkbox label under Filters based on the passed filter name
inventory.prototype.clickFilterCheckBoxLabelBasedOnName = function(filterName){
	var current=this;
	return this.getIndexofFilter(filterName).then(function(index){
		var elem = element.all(by.css(current.filterCheckBoxesLabelCss)).get(index);
		browser.wait(EC.elementToBeClickable(elem), 5000);
	   return elem.click();
   })
};

//This function is used to check if the status or providers checkbox under Filters are checked or not based on the passed filter name
inventory.prototype.isSelectedFilterCheckBoxBasedOnName = function(filterName){
	var current=this;
	return this.getIndexofFilter(filterName).then(function(index){
		var elem = element.all(by.css(current.filterCheckBoxesCss)).get(index);
		browser.wait(EC.elementToBeClickable(elem), 5000);
		return elem.isSelected().then(function(selected) {
			return selected
		})
	});
}
	
inventory.prototype.verifyFiltersApplied = function (searchText, filterBy) {
	var isFilterApplied = false;
	flag = false;
	var elementList;
	
	//Check for no data availability in table
	element(by.xpath(this.filtersNoDataTextXpath)).isPresent().then(function(present){
		if(present){
			logger.info('Filter test : ' + searchText + '\n Inventory records is not available in table. Please manually verify once. For now passing the test \n')
        	flag=true;
        	return flag;
		}else logger.info('Filter test : ' + searchText + '\n Inventory records is available in table. Proceeding to verification of filters \n');
    });
    
	//Get 'filterBy' column in table and check to see filters are applied as selected
	if(searchText.length > 0){
		if(filterBy == "status")
			elementList = element.all(by.xpath("(.//*[@class='bx--responsive-table']/tbody/tr[contains(@class, 'bx--table-row')]/td[contains(@class, 'bx--table-column')][2]/div/div[contains(@class, 'bx--table-cell--truncate')])"));
		else if(filterBy == "provider")
			elementList = element.all(by.xpath("(.//*[@class='bx--responsive-table']/tbody/tr[contains(@class, 'bx--table-row')]/td[contains(@class, 'bx--table-column')][4]/div/div[contains(@class, 'bx--table-cell--truncate')])"));
   		
   		var rows = elementList.map(function(eachName){
   			return eachName.getText();	                
	    });
   		//Concatenate each row contents and check if search string is present on each row. Even if search string not found in a single row, the test will fail immediately and stops checking further rows
   		isFilterApplied = rows.then(function (result) {
		    for (var i = 0; i < result.length; i++) {
		    	flag = false;
		    	//logger.info("result[i]");
		    	//For each row verify if searchText is present in that row
		    	for(var j = 0; j < searchText.length; j++){		    	
		    		if((result[i]).indexOf(searchText[j]) >= 0){
			    		flag = true;
			    		//logger.info("Found - \"" + searchText[j]+ "\" in row : " + result[i]);
			    		j = searchText.length;
			    	}
		    	}
		    	if (flag == false) {
		    		logger.info("None of the Filter search text matches for the Row text : " + result[i] + " - in row number : " + i);
		    		return flag;	    	
		    	}
		    }
		    return flag;
		});
	}else isFilterApplied = true;
	
return isFilterApplied;
};

inventory.prototype.checkFilterLabelBasedOnName = function(filterName){
	var current=this;
	return this.getIndexofFilter(filterName).then(function(index){
		var elem = element.all(by.css(current.filterCheckBoxesCss)).get(index);
        browser.wait(EC.elementToBeClickable(elem), 5000);
        return elem.isPresent().then(function(present) {
        	return present
        	})
        });
}

//This function is used to get complete list of providers in Filters
inventory.prototype.getListofFilterProviders = function(){
	return element.all(by.css(this.filterProviderNamesCss)).getText()

};


//************************ End of Functions for Filters *******************

//************************ Functions for Pagination ******************* //

inventory.prototype.countTableRecords = function()
{
        var numberOfColumns = 13;
        util.waitForAngular();
        var elementList = element.all(by.xpath("(.//*[@class='bx--responsive-table']/tbody/tr[contains(@class, 'bx--table-row')]/td[contains(@class, 'bx--table-column')]/div/div[contains(@class, 'bx--table-cell--truncate')])"));
        var rows = elementList.map(function(eachName){
            return eachName.getText();                    
   });
        //Count the number of rows in the table and return it
    return rows.then(function (result) {
        var count = 0;
        if (result.length == 0) return count;
        for (var i = 0; i < result.length; i=i+numberOfColumns) {
            count = count + 1;
            logger.info("The number of rows in table = " + count);
        }
        return count;
    });
};

//function used in search also
inventory.prototype.getNumberOfPagesText = function()
{
    return element.all(by.css(this.numberOfPagesTextCss)).last().getText();
};
//function used in search also
inventory.prototype.clickPaginationRightArrow = function(pages)
{	
    for(var i=0 ; i<4 ; i++) element(by.xpath(this.paginationRightArrowXpath)).click();
    util.waitForAngular();
};
inventory.prototype.clickPaginationLeftArrow = function(pages)
{
    for(var i=0 ; i<4 ; i++) element(by.xpath(this.paginationLeftArrowXpath)).click();
    util.waitForAngular();
};
inventory.prototype.clickSelectItemPerPage= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.selectInputXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
};
inventory.prototype.clickFirstRecordItemPerPage= function(item)
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.firstitemPerPageCss))), 5000);
   	return element(by.css(this.firstitemPerPageCss)).click();
};

inventory.prototype.clickSecondRecordItemPerPage= function(item)
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.seconditemPerPageCss))), 5000);
   	return element(by.css(this.seconditemPerPageCss)).click();
};
inventory.prototype.clickThirdRecordItemPerPage= function(item)
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.thirditemPerPageCss))), 5000);
   	return element(by.css(this.thirditemPerPageCss)).click();
};

//************************ End of Functions for Pagination *******************

//************************ Functions for Sort ******************* //

//this function is used to click on Instance name to sort that column
inventory.prototype.clickInstanceName = function() {
//	browser.wait(EC.elementToBeClickable(element(by.css(this.instanceNameColumnNameCss))), 5000);
	browser.sleep(5000);
	util.waitForAngular();
   	return element(by.css(this.instanceNameColumnNameCss)).click();
}

//this function is used to click on Status to sort that column
inventory.prototype.clickStatus = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.statusCoulmnNameCss))), 5000);
   	return element(by.css(this.statusCoulmnNameCss)).click();
}

//this function is used to click on Provisioned Date to sort that column
inventory.prototype.clickProvisionedDate = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.provisionedDateColumnNameCss))), 5000);
   	return element(by.css(this.provisionedDateColumnNameCss)).click();
}

//this function is used to click on Provider to sort that column
inventory.prototype.clickProvider = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.providerColumnNameCss))), 5000);
   	return element(by.css(this.providerColumnNameCss)).click();
}

//this function is used to click on Provider Account to sort that column
inventory.prototype.clickProviderAccount = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.providerAccountColumnNameCss))), 5000);
   	return element(by.css(this.providerAccountColumnNameCss)).click();
}

//this function is used to click on Team to sort that column
inventory.prototype.clickTeam = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.teamColumnNameCss))), 5000);
   	return element(by.css(this.teamColumnNameCss)).click();
}

//this function is used to click on Ordered By to sort that column
inventory.prototype.clickOrderedBy = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderedByColumnNameCss))), 5000);
   	return element(by.css(this.orderedByColumnNameCss)).click();
}

//this function is used to click on Service Name to sort that column
inventory.prototype.clickServiceName = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.serviceNameColumnNameCss))), 5000);
   	return element(by.css(this.serviceNameColumnNameCss)).click();
}

//this function is used to click on Estimated Cost to sort that column
inventory.prototype.clickEstimatedCost = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.estimatedCostColumnNameCss))), 5000);
   	return element(by.css(this.estimatedCostColumnNameCss)).click();
}

//this function is used to click on Currency to sort that column
inventory.prototype.clickCurrency = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.currencyColumnNameCss))), 5000);
   	return element(by.css(this.currencyColumnNameCss)).click();
}

//this function is used to check if Instance Name column is sorted
inventory.prototype.checkIfInstanceNameColumnIsSorted = function () {	  
	//var elementList = element.all(by.xpath(instanceNameColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][1]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		unSorted = unSorted.map(function(value) {

            return value.toLowerCase();
        });
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		console.log("sorted");
		console.log(sorted)
		console.log("unsorted");
		console.log(unSorted)
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Status column is sorted
inventory.prototype.checkIfStatusColumnIsSorted = function () {
	//var elementList = element.all(by.xpath(statusColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][2]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Provisioned Date column is sorted
inventory.prototype.checkIfProvisionedDateColumnIsSorted = function () {	  
	//var elementList = element.all(by.xpath(provisionedDateColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][3]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Provider column is sorted
inventory.prototype.checkIfProviderColumnIsSorted = function () {	  
	//var elementList = element.all(by.xpath(providerColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][4]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Provider Account column is sorted
inventory.prototype.checkIfProviderAccountColumnIsSorted = function () {  
	//var elementList = element.all(by.xpath(providerAccountColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][5]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Team column is sorted
inventory.prototype.checkIfTeamColumnIsSorted = function () {
	//var elementList = element.all(by.xpath(teamColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][6]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Ordered By column is sorted
inventory.prototype.checkIfOrderedByColumnIsSorted = function () {
	//var elementList = element.all(by.xpath(orderedByColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][7]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Service Name column is sorted
inventory.prototype.checkIfServiceNameColumnIsSorted = function () {  
	//var elementList = element.all(by.xpath(serviceNameColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][8]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Estimated Cost column is sorted
inventory.prototype.checkIfEstimatedCostColumnIsSorted = function () { 
	//var elementList = element.all(by.xpath(estimatedCostColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][9]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

//this function is used to check if Currency column is sorted
inventory.prototype.checkIfCurrencyColumnIsSorted = function () {
	//var elementList = element.all(by.xpath(currencyColumnXpath));
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][10]'))
	elementList.map(function(eachName){
		return eachName.getText().then(function(unSorted){
			return unSorted;
		});
	}).then(function(unSorted){
		var sorted = unSorted.slice();
		sorted = sorted.sort();
		expect(sorted).toEqual(unSorted);
	});
}

inventory.prototype.clickViewingColumnRightArrow = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.viewingColumnRightArrowCss))), 5000);
   	return element(by.css(this.viewingColumnRightArrowCss)).click();
}

//************************ End of Functions for Sort *******************

//************************ Functions for Search ******************* //

inventory.prototype.searchInTable = function(seachText)
{     
	element(by.css(this.searchTextBoxCss)).clear();
	element(by.css(this.searchTextBoxCss)).sendKeys(seachText);
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    //browser.sleep(5000);
};

inventory.prototype.verifySearchOnCurrentPage = function(searchText)
{
	logger.info("Searching for text :" + searchText);
	var numberOfColumns = 13;
	var ro = [];
	util.waitForAngular();
	var elementList = element.all(by.xpath("(.//*[@class='bx--responsive-table']/tbody/tr[contains(@class, 'bx--table-row')]/td[contains(@class, 'bx--table-column')]/div/div[contains(@class, 'bx--table-cell--truncate')])"));
	var rows = elementList.map(function(eachName){
		return eachName.getText();	                
	});
		
	//Concatenate each row contents and check if search string is present on each row of the initial columns displayed
	//Even if search string not found in a single row, the test will fail immediately and stops checking further rows
	var strFound = rows.then(function (result) {
		var row = "";
		var found = false;
		//logger.info(result);
		//console.log("result : " + result)
		for (var i = 0; i < result.length; i=i+numberOfColumns) {
	    	for (var j = i; j < i+numberOfColumns; j++){
	    		row = row + result[j]
	    	}
	    	//logger.info(row);
	    	//console.log("row : " + row)
	    	//For each row verify if searchText is present in that row
	    	if((row.toLowerCase()).indexOf(searchText.toLowerCase()) >= 0){
	    		found = true;
	    		logger.info("Found - \"" + searchText + "\" in row : " + row);
	    	}
	    	else{
	    		found = false;
	    		logger.info(searchText + " not Found in row : " + row);
	    		return found;
	    	}
	    	row = "";
	    }
	    return found;
	});
	
	//Click right arrow and display remaining columns
	for(var c=numberOfColumns;c>numberOfColumns-5;c--){
		element.all(by.css(this.clickviewingColumnsRightArrow()));
	}
	
	//Search text in remaining columns
	var rows1 = elementList.map(function(eachName){
		return eachName.getText();	                
	});
	
	//Click left arrow and display initial columns
	for(var c=numberOfColumns;c>numberOfColumns-5;c--){
		element.all(by.css(this.clickviewingColumnsLeftArrow()));
	}
		
	//Concatenate each row contents and check if search string is present on each row
	//Even if search string not found in a single row, the test will fail immediately and stops checking further rows
	var strFound1 = rows1.then(function (result) {
		var row = "";
		var found = false;
		for (var i = 0; i < result.length; i=i+numberOfColumns) {
	    	for (var j = i; j < i+numberOfColumns; j++){
	    		row = row + result[j]
	    	}
	    	//logger.info(row);
	    	//For each row verify if searchText is present in that row
	    	if((row.toLowerCase()).indexOf(searchText.toLowerCase()) >= 0){
	    		found = true;
	    		logger.info("Found - \"" + searchText + "\" in row : " + row);
	    	}
	    	else{
	    		found = false;
	    		logger.info(searchText + " not Found in row : " + row);
	    		return found;
	    	}
	    	row = "";
	    }
	    return found;
	});
	
	return protractor.promise.all([strFound, strFound1]).then(function (values) {
			return (values[0] || values[1]);
		});
};

inventory.prototype.clickPaginationLeftArrow_gotoFirst = function(pages)
{
	for(var i=0 ; i<pages ; i++) element(by.css(this.paginationLeftArrowCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickviewingColumnsLeftArrow_gotoFirst = function()
{
	for(var i=0 ; i<5 ; i++) element(by.css(this.viewingColumnsLeftArrowCss)).click();
	util.waitForAngular();
};

//************************ End of Functions for Search *******************

//************************ Functions for Edit Service ******************* //

inventory.prototype.isEnabledEditServiceMenuOption = function()
{
	return element(by.css(this.editserviceCss)).isEnabled();
};

inventory.prototype.clickEditServiceIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.editserviceCss))), 15000);
   	return element(by.css(this.editserviceCss)).click();
};

inventory.prototype.clickEditServiceNextButton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.editServiceNextButtonCss))), 5000);
   	return element(by.css(this.editServiceNextButtonCss)).click();
};

inventory.prototype.clickEditServiceNextAdditionalParamsButton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.editServiceNextButtonAdditionalParamsCss))), 5000);
   	return element(by.css(this.editServiceNextButtonAdditionalParamsCss)).click();
};

inventory.prototype.clickEditMoreLink = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.editMoreLinkCss))), 5000);
   	return element(by.css(this.editMoreLinkCss)).click();
};

inventory.prototype.clickEditCancelButton = function()
{
	return element(by.xpath(this.editCancelButtonCss)).click();
	util.waitForAngular();
}

inventory.prototype.setCPUDropDown = function()
{
	element(by.css(this.editCPUDropDownCss)).click();
	element(by.css(this.editCPUDropDownValue2Css)).click();
	util.waitForAngular();
}

inventory.prototype.getUpdatedBOM = function()
{
	return element.all(by.css(this.editServiceBillOfMaterialsCss)).get(0).getText();
}

inventory.prototype.getCurrentBOM = function()
{
	return element.all(by.css(this.editServiceBillOfMaterialsCss)).get(1).getText();
}

inventory.prototype.getEditCurrentCPUText = function()
{
	return element.all(by.css(this.editCurrentCPUTextCss)).get(2).getText();
}

inventory.prototype.getEditStrikedCPUText= function()
{
	return element(by.css(this.editstrikedCPUTextCss)).getText();
}

inventory.prototype.getEditUpdatedTagText= function()
{
	return element(by.css(this.editupdatedTagTextCss)).getText();
}

inventory.prototype.getEditOrderNumberText= function()
{
	return element(by.css(this.editOrderNumberCss)).getText();
}

inventory.prototype.clickCurrentBOMButton= function()
{
	return element(by.css(this.editCurrentBOMButtonCss)).click();
	util.waitForAngular();
}

inventory.prototype.clickUpdatedBOMButton= function()
{
	return element(by.css(this.editUpdatedBOMButtonCss)).click();
	util.waitForAngular();
}

inventory.prototype.clickEditSubmitOrderButton= function()
{
	return element(by.css(this.editSubmitOrderButtonCss)).click();
	util.waitForAngular();
}

inventory.prototype.clickEditGoToInventoryButton= function()
{
	return element(by.css(this.editGoToInventoryButtonCss)).click();
	util.waitForAngular();
}

//this function is used to get Status of SOI
inventory.prototype.getStatusOfSOI = function () {
	var elementList = element.all(by.xpath('//*[@class="bx--responsive-table"]/tbody/tr[contains(@class, "bx--table-row")]/td[contains(@class, "bx--table-column")][2]'))
	var status_SOI = elementList.map(function(eachName){
						return eachName.getText().then(function(unSorted){
								return unSorted;
						});
					}).then(function(unSorted){
							console.log (unSorted[0])
							return unSorted[0]
						});
	return status_SOI
}

//************************ End of Functions for Edit Service *******************

//************************ Functions for Delete Service ******************* //

inventory.prototype.isEnabledDeleteServiceMenuOption = function()
{
	return element(by.css(this.deleteserviceCss)).isEnabled();
};

inventory.prototype.clickDeleteServiceIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteserviceCss))), 5000);
   	return element(by.css(this.deleteserviceCss)).click();
};
inventory.prototype.clickDeleteServicecheckboxIcon = function()
{
	return element.all(by.css(this.deleteservicecheckboxCss)).first().click();
};

inventory.prototype.clickDeleteServiceOkaybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteserviceOkayCss))), 5000);
   	return element(by.css(this.deleteserviceOkayCss)).click();
};

inventory.prototype.getDeleteOrderNumberFromPopUpText= function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteOrderNumberFromPopUpTextCss))), 10000);
	return element(by.css(this.deleteOrderNumberFromPopUpTextCss)).getText().split(":")[1].trim();
}

//************************ End of Functions for Delete Service *******************

inventory.prototype.searchOrderByServiceName = function(serviceName)
{	
	var curr = this;
	browser.wait(EC.elementToBeClickable(element(by.css(curr.searchTextBoxCss))), 15000).then(function(){
		var searchInputBox = element(by.css(curr.searchTextBoxCss));
		util.waitForAngular();
		searchInputBox.sendKeys(serviceName);
		searchInputBox.sendKeys(protractor.Key.ENTER);	
		util.waitForAngular();
		browser.sleep(2000);
		//wait till service instance is displayed	
		browser.wait(EC.elementToBeClickable(element(by.css(curr.instanceTableActionIconCss))), 60000);
	});
	
};

//****************** Functions for Instance Table ************

inventory.prototype.clickDeleteFirstInstance = function () {
	var curr = this;
	return element.all(by.css(this.instanceTableActionIconCss)).first().click().then(function () {
		logger.info("Clicked on the Actions icon from the first row on Inventory page");
		browser.wait(EC.elementToBeClickable(element(by.buttonText(curr.buttonTextDeleteService))), 40000);
		return element(by.buttonText(curr.buttonTextDeleteService)).click().then(function () {
			logger.info("Clicked on Delete Service button");
		});
		util.waitForAngular();
	});
};

//****************** Functions for Delete Service Modal ************

// This function is used to click 'Ok' in the Delete Service Modal
inventory.prototype.clickOKDeleteServiceModal = function(){
	var curr=this;
	browser.wait(EC.elementToBeClickable(element(by.css(curr.deleteServiceModalOKButtonCss))), 10000).then(function(){
		element(by.css(curr.deleteServiceModalOKButtonCss)).click().then(function(){
			logger.info("Clicked on OK button on Delete Service modal dialog");
		});
	});
	//util.waitForAngular();
    browser.sleep(2500);
};

//This function is used to click 'Cancel' in the Delete Service Modal
inventory.prototype.clickCancelDeleteServiceModal = function() {
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteServiceModalCancelButtonCss))), 5000);
   	element(by.css(this.deleteServiceModalCancelButtonCss)).click();
   	util.waitForAngular();
};

//This function is used to click 'Close X' in the Delete Service Modal
inventory.prototype.clickCloseXDeleteServiceModal = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteServiceModalCloseXButtonCss))), 5000);
   	element(by.css(this.deleteServiceModalCloseXButtonCss)).click();
   	util.waitForAngular();
};

//This function is used to click checkbox to confirm Delete Service in the Delete Service Modal
inventory.prototype.clickConfirmCheckBoxDeleteServiceModal = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteServiceModalConfirmCheckBoxCss))), 5000);
   	element(by.css(this.deleteServiceModalConfirmCheckBoxCss)).click().then(function(){
   		logger.info("Checked Confirm checkbox on Delete Service modal dialog");
   	});
	util.waitForAngular();
};




inventory.prototype.getTopHeaderText = function () {
	return element(by.css(this.inventoryTopHeaderTextCss)).getText();
}

inventory.prototype.clickInventoryTab = function() {
    return element(by.xpath(this.inventoryTabXpath)).click();
}

//************************ Import button******************* //
inventory.prototype.clickImportIcon = function()
{
    browser.wait(EC.elementToBeClickable(element(by.css(this.importIconCss))), 5000);
    return element(by.css(this.importIconCss)).click();
};

inventory.prototype.clickUploadFileIcon = function()
{
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.uploadFileIconXpath))), 5000);
    return element(by.xpath(this.uploadFileIconXpath)).click();
};

//************************ Functions for Clicking Search button******************* //
inventory.prototype.clickSearchIcon = function()
{
    browser.wait(EC.elementToBeClickable(element(by.css(this.searchIconCss))), 5000);
    return element(by.css(this.searchIconCss)).click();
};


inventory.prototype.clickviewingColumnsRightArrow = function()
{
	element(by.css(this.viewingColumnsRightArrowCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickviewingColumnsLeftArrow = function()
{
	element(by.css(this.viewingColumnsLeftArrowCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickviewingColumnsRightArrow_gotoLast = function()
{
	for(var i=0 ; i<5 ; i++) element(by.css(this.viewingColumnsRightArrowCss)).click();
	util.waitForAngular();
};


inventory.prototype.clickPaginationRightArrow_gotoLast = function(pages)
{
	for(var i=0 ; i<pages ; i++) element(by.css(this.paginationRightArrowCss)).click();
	util.waitForAngular();
};



inventory.prototype.isPresentNoDataAvailableText = function()
{
	return element(by.css(this.noDataAvailableTextCss)).isPresent();
};

inventory.prototype.clickitemsPerPageText = function()
{
	return element.all(by.css(this.itemsPerPageTextCss)).first().click();
};
	

/************************start of order history page***********************************************/
inventory.prototype.clickOrderId= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.orderIdColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
}
inventory.prototype.clickOperationType= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.operationTypeColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
}
inventory.prototype.clickStatusColumn= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.statusColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
}
inventory.prototype.clickRequestedBy= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.requestedByColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
}
inventory.prototype.clickEstimatedCostCurrency= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.estimatedcostcurrencyColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
}
inventory.prototype.clickErrorFailure= function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.errorFailureColumnNameXpath))), 5000);
   	return element(by.xpath(this.selectInputXpath)).click();
};


/************************end of order history page***********************************************/

//************************ Functions for View Properties******************* //
inventory.prototype.clickSelectedSOIGlificon = function()
{
	return element(by.css(this.selectedSOIGlificonCss)).click();	
};

inventory.prototype.clickViewService = function()
{	
	//return element.all(by.css(this.viewServiceCss)).first().click();
	return element(by.buttonText(this.viewServiceButtonText)).click().then(function(){
		logger.info("Clicked on View Service Button in Inventory Page")
	});
};

inventory.prototype.isServiceNameOfSelectedSOIAvailable = function()
{
	return element.all(by.css(this.serviceNameOfSelectedSOICss)).isPresent();    
};

inventory.prototype.isProviderServiceInstanceIdSOIAvailable = function()
{
	return element(by.xpath(this.providerServiceInstanceIdXpath)).isPresent();    
};


//************************ Functions for Individual Service ID Search and performing other actions ******************* //

inventory.prototype.clickSearchIcon = function()
{
   		browser.wait(EC.elementToBeClickable(element(by.css(this.searchIconCss))), 5000);
   	   	return element(by.css(this.searchIconCss)).click();
};

inventory.prototype.searchInTable = function(seachText)
{     
   	    element(by.css(this.searchTextBoxCss)).clear();
   	    element(by.css(this.searchTextBoxCss)).sendKeys(seachText);
   	    browser.actions().sendKeys(protractor.Key.ENTER).perform();
}; 

inventory.prototype.clickGlificonIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.GlificonIconXpath))), 5000);
   	return element(by.xpath(this.GlificonIconXpath)).click();
};
inventory.prototype.clickViewServiceIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.viewserviceXpath))), 5000);
   	return element(by.xpath(this.viewserviceXpath)).click();
};

inventory.prototype.clickOrderHistorTab = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.orderhistoryCss))), 5000);
   	return element(by.css(this.orderhistoryCss)).click();
};
inventory.prototype.clickViewServiceClosebutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.viewservicecloseXpath))), 5000);
   	return element(by.xpath(this.viewservicecloseXpath)).click();
};
inventory.prototype.clickGlificonIcon1 = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.GlificonIconXpath))), 5000);
   	return element(by.xpath(this.GlificonIconXpath)).click();
};

inventory.prototype.clickRefreshServiceIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.refreshserviceXpath))), 5000);
   	return element(by.xpath(this.refreshserviceXpath)).click();
};
inventory.prototype.clickRefreshServiceOakybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.refreshserviceOkayCss))), 5000);
   	return element(by.css(this.refreshserviceOkayCss)).click();
};
/*---------------------------------------------------------------------*/
inventory.prototype.isInstanceNamePresent = function(){
 return element(by.css(this.instanceNameColumnNameCss)).click().then(function() {
	 logger.info("Instance Name clicked successfully");
     return true;
     }, function(err) {
    	 var errName = err.toString();
    	 if(errName.indexOf("ElementNotVisibleError") != -1){
    		 return false;
    		 }
    	 else
    		 throw err;
     	});
};

inventory.prototype.isStatusPresent = function(){
	return element(by.css(this.statusCoulmnNameCss)).click().then(function() {
		logger.info("Status clicked successfully");
	    return true;
	    }, function(err) {
	    	var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	            return false;
	          	}
	        else
	           throw err;
	       });
	};

inventory.prototype.isProvisionedDatePresent = function(){
	return element(by.css(this.provisionedDateColumnNameCss)).click().then(function() {
		logger.info("Provisioned Date clicked successfully");
	    return true;
	    }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	            return false;
	            }
	        else
	           throw err;
	         });
	};

inventory.prototype.isProviderPresent = function(){
	return element(by.css(this.providerColumnNameCss)).click().then(function() {
	    logger.info("Provider clicked successfully");
	    return true;
	    }, function(err) {
	       var errName = err.toString();
	       if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	       else
	           throw err;
	         });
	};

inventory.prototype.isProviderAccountPresent = function(){
	return element(by.css(this.providerAccountColumnNameCss)).click().then(function() {
	   logger.info("Provider Account clicked successfully");
	   return true;
	   }, function(err) {
	      var errName = err.toString();
	      if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	      else
	           throw err;
	         });
	};

inventory.prototype.isTeamPresent = function(){
	return element(by.css(this.teamColumnNameCss)).click().then(function() {
	   logger.info("Team clicked successfully");
	   return true;
	   }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	            return false;
	           }
	        else
	           throw err;
	         });
	};
	
inventory.prototype.isOrderedByPresent = function () {
	return element(by.css(this.orderedByColumnNameCss)).click().then(function() {
	   logger.info("Ordered By clicked successfully");
	   return true;
	   }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	        else
	           throw err;
	         });
	}
	
inventory.prototype.isServiceNamePresent = function () {
	return element(by.css(this.serviceNameColumnNameCss)).click().then(function() {
	   logger.info("Service Name clicked successfully");
	   return true;
	   }, function(err) {
	       var errName = err.toString();
	       if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	       else
	           throw err;
	         });
	}
	
inventory.prototype.isEstimatedCostPresent = function () {
	return element(by.css(this.estimatedCostColumnNameCss)).click().then(function() {
	  logger.info("Estimated Cost clicked successfully");
	  return true;
	  }, function(err) {
	      var errName = err.toString();
	      if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	      else
	           throw err;
	         });
	}
	
inventory.prototype.isCurrencyPresent = function () {
	return element(by.css(this.currencyColumnNameCss)).click().then(function() {
	   logger.info("Currency clicked successfully");
	   return true;
	   }, function(err) {
	       var errName = err.toString();
	       if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	        }
	       else
	           throw err;
	      });
	}

inventory.prototype.expandFirstRow = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.firstrowAccordianXpath))), 5000);
	return element(by.xpath(this.firstrowAccordianXpath)).click();
	
}

inventory.prototype.isViewingColumnDisabled = function()
{
	browser.wait(EC.presenceOf(element(by.xpath(this.viewingColumnScrollArrowsDisabledXpath))), 5000);
	return element(by.xpath(this.viewingColumnScrollArrowsDisabledXpath)).isPresent();
    
}

/*-----------------------------------------------------------------------------------*/
inventory.prototype.isOrderIdPresent = function(){
 return element(by.xpath(this.orderIdColumnNameXpath)).click().then(function() {
	 console.log("Order Name clicked successfully");
     return true;
     }, function(err) {
    	 var errName = err.toString();
    	 if(errName.indexOf("ElementNotVisibleError") != -1){
    		 return false;
    		 }
    	 else
    		 throw err;
     	});
};
inventory.prototype.isOperationTypePresent = function(){
	return element(by.xpath(this.operationTypeColumnNameXpath)).click().then(function() {
		console.log("Operation Type clicked successfully");
	    return true;
	    }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	            return false;
	            }
	        else
	           throw err;
	         });
	};

inventory.prototype.isStatusPresent = function(){
	return element(by.xpath(this.statusColumnNameXpath)).click().then(function() {
	    console.log("Status Column clicked successfully");
	    return true;
	    }, function(err) {
	       var errName = err.toString();
	       if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	       else
	           throw err;
	         });
	};

inventory.prototype.isRequestedByPresent = function(){
	return element(by.xpath(this.requestedByColumnNameXpath)).click().then(function() {
	   console.log("Requested By clicked successfully");
	   return true;
	   }, function(err) {
	      var errName = err.toString();
	      if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	      else
	           throw err;
	         });
	};

inventory.prototype.isEstimatedCostCurrencyPresent = function(){
	return element(by.xpath(this.estimatedcostcurrencyColumnNameXpath)).click().then(function() {
	   console.log("Estimated Cost Currency clicked successfully");
	   return true;
	   }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	            return false;
	           }
	        else
	           throw err;
	         });
	};
	
inventory.prototype.isErrorFailurePresent = function () {
	return element(by.xpath(this.errorFailureColumnNameXpath)).click().then(function() {
	   console.log("Is Error Failure clicked successfully");
	   return true;
	   }, function(err) {
	        var errName = err.toString();
	        if(errName.indexOf("ElementNotVisibleError") != -1){
	           return false;
	          }
	        else
	           throw err;
	         });
	}

inventory.prototype.isHeadingNamePresent = function(){
    return element(by.xpath(this.connectVMInstructionXpath)).click().then(function() {
        console.log("Instance Name clicked successfully");
        return true;
        }, function(err) {
            var errName = err.toString();
            if(errName.indexOf("ElementNotVisibleError") != -1){
                return false;
                }
            else
                throw err;
            });
};	
/*-----------------------------------------------------------------------------------*/


//************************ Functions for Individual Asset ID Search and performing other actions ******************* //

inventory.prototype.clickExpansionIcon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.expansionIconXpath))), 5000);
   	return element(by.xpath(this.expandIconXpath)).click();
};


/*-----------------------------------------------------------------------------------*/

//************************ Functions for role management and view component properties ******************* //

inventory.prototype.isEnabledViewServiceMenuOption = function()
{
	return element(by.xpath(this.viewserviceXpath)).isEnabled();
};

inventory.prototype.isEnabledRefreshStatusMenuOption = function()
{
	return element(by.xpath(this.refreshStatusXpath)).isEnabled();
};

//Batch SOC operation menu item methods

inventory.prototype.isEnabledbatchActionsMenuSOCTurnOn = function()
{
	return element(by.xpath(this.batchActionsMenuSOCTurnOnXpath)).isEnabled();
};

inventory.prototype.isEnabledbatchActionsMenuSOCTurnOff = function()
{
	return element(by.xpath(this.batchActionsMenuSOCTurnOffXpath)).isEnabled();
};

inventory.prototype.isEnabledbatchActionsMenuSOCReboot = function()
{
	return element(by.xpath(this.batchActionsMenuSOCRebootXpath)).isEnabled();
};

inventory.prototype.isEnabledbatchActionsMenuSOCRefresh = function()
{
	return element(by.xpath(this.batchActionsMenuSOCRefreshXpath)).isEnabled();
};

inventory.prototype.expandFirstRow = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.firstrowAccordianXpath))), 5000);
	return element(by.xpath(this.firstrowAccordianXpath)).click();
	
}

inventory.prototype.clickOverflowMenuIcon = function()
{
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.menuIconXpath))), 5000);
    return element(by.xpath(this.menuIconXpath)).click();
    
}

inventory.prototype.clickoverflowmenuoptions= function()
{
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.overflowmenuoptionsXpath))), 3000);
      return element(by.xpath(this.overflowmenuoptionsXpath)).click();
};

inventory.prototype.isViewingColumnDisabled = function()
{
	browser.wait(EC.presenceOf(element(by.xpath(this.viewingColumnScrollArrowsDisabledXpath))), 5000);
	return element(by.xpath(this.viewingColumnScrollArrowsDisabledXpath)).isPresent();
    
}

inventory.prototype.clickExpandFirstRow = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.expandFirstRowXpath))), 10000);
   	return element(by.xpath(this.expandFirstRowXpath)).click();
};

inventory.prototype.clickBatchActionsMenuGlifficon = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.batchActionsMenuGlifficonXpath))), 5000);
   	return element(by.xpath(this.batchActionsMenuGlifficonXpath)).click();
};

inventory.prototype.clickGlificonIconOfSOC = function()
{
	browser.ignoreSynchronization = true;
   	element(by.xpath(this.GlificonIconOfSOCXpath)).click();
//   	browser.ignoreSynchronization = false;
};

inventory.prototype.clickSOIcheckbox = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.SOIcheckboxXpath))), 5000);
   	return element(by.xpath(this.SOIcheckboxXpath)).click();
};

inventory.prototype.clicksOCFirstChildComponent = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.sOCFirstChildComponentXpath))), 5000);
   	return element(by.xpath(this.sOCFirstChildComponentXpath)).click();
};

inventory.prototype.clicksOCSecondChildComponent = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.sOCSecondChildComponentXpath))), 5000);
   	return element(by.xpath(this.sOCSecondChildComponentXpath)).click();
};

inventory.prototype.isEnabledTurnOnActionMenuOption = function()
{
	return element(by.css(this.turnOnActionMenuOptionCss)).isEnabled();
};

inventory.prototype.isEnabledTurnOffActionMenuOption = function()
{
	return element(by.css(this.turnOffActionMenuOptionCss)).isEnabled();
};

inventory.prototype.isEnabledRebootActionMenuOption = function()
{
	return element(by.css(this.RebootActionMenuOptionCss)).isEnabled();
};

inventory.prototype.isEnabledRefreshStatusActionMenuOption = function()
{
	return element(by.css(this.refreshStatusActionMenuOptionCss)).isEnabled();
};

inventory.prototype.isEnabledViewComponentActionMenuOption = function()
{
	return element(by.css(this.viewComponentActionMenuOptionCss)).isEnabled();
};

inventory.prototype.clickViewComponentActionMenuOption = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.viewComponentActionMenuOptionCss))), 5000);
	return element(by.css(this.viewComponentActionMenuOptionCss)).click();
};

inventory.prototype.clickViewComponentCloseButton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.ViewComponentCloseButtonXpath))), 5000);
   	return element(by.xpath(this.ViewComponentCloseButtonXpath)).click();
};

inventory.prototype.clickViewComponentCloseButtonAWS = function()
{   var closeButton = "//carbon-slide-over-panel[2]/div/header/carbon-icon"
	browser.wait(EC.elementToBeClickable(element(by.xpath(closeButton))), 5000);
	console.log("clicked on view componenet close button");
   	return element(by.xpath(closeButton)).click();
};

inventory.prototype.isEnabledAccessComponentActionMenuOption = function()
{
	return element(by.css(this.accessComponentActionMenuOptionCss)).isEnabled();
};

inventory.prototype.isEnabledbatchActionsMenuDeleteSelected = function()
{
	return element(by.xpath(this.batchActionsMenuDeleteSelectedXpath)).isEnabled();
};

inventory.prototype.isEnabledbatchActionsMenuRefreshStatuses = function()
{
	return element(by.xpath(this.batchActionsMenuRefreshStatusesXpath)).isEnabled();
};

//View component properties methods
inventory.prototype.getcomponentTypeProp = function()
{
	return element.all(by.xpath(this.componentTypePropXpath)).getText().then(function(text) {
	    return text
	});
};

inventory.prototype.getnameProp = function()
{
	return element.all(by.xpath(this.namePropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getstatusProp = function()
{
	return element.all(by.xpath(this.statusPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getproviderNameProp = function()
{
	return element.all(by.xpath(this.providerNamePropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getresourceIdProp = function()
{
	return element.all(by.xpath(this.resourceIdPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.gettagsProp = function()
{
	return element.all(by.xpath(this.tagsPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getavailabilityZoneProp = function()
{
	return element.all(by.xpath(this.availabilityZonePropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getavailableIpAddressCountProp = function()
{
	return element.all(by.xpath(this.availableIpAddressCountPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getcidrBlockProp = function()
{
	return element.all(by.xpath(this.cidrBlockPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getdefaultForAzProp = function()
{
	return element.all(by.xpath(this.defaultForAzPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getmapPublicIpOnLaunchProp = function()
{
	return element.all(by.xpath(this.mapPublicIpOnLaunchPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getstateProp = function()
{
	return element.all(by.xpath(this.statePropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getsubnetIdProp = function()
{
	return element.all(by.xpath(this.subnetIdPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getvpcIdProp = function()
{
	return element.all(by.xpath(this.vpcIdPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getassignIpv6aAddressOnCreationProp = function()
{
	return element.all(by.xpath(this.assignIpv6aAddressOnCreationPropXpath)).getText().then(function(text) {
		return text
	});
};
inventory.prototype.getipv6CidrBlockAssociationSetProp = function()
{
	return element.all(by.xpath(this.ipv6CidrBlockAssociationSetPropXpath)).getText().then(function(text) {
		return text
	});
};

inventory.prototype.getViewComponentPropertyAWS = function(labelName)
{//    browser.ignoreSynchronization = true;
	browser.waitForAngular();
	var label =  "//h5[contains(text(),'" + labelName + "')]/following-sibling::p"
	browser.wait(EC.visibilityOf(element(by.xpath(label))),3000);
	return element(by.xpath(label)).getText().then(function(text){
	logger.info("The value for "+labelName+" is : "+text)
	return text;
    });
	
}

//****************FUNCTIONS IN DELETE ORDER SUBMITTED POP UP***************************

inventory.prototype.getTextdeleteOrderSubmittedHeaderModal = function() {
    return element(by.xpath(this.deleteOrderSubmittedHeaderModalXpath)).getText().then(function(text){
        logger.info(text)
        return text;
    });
};

inventory.prototype.getTextdeleteServiceModalNotificationMessage = function()
{
	return element(by.css(this.deleteServiceModalNotificationBoxTextCss)).getText().then(function(text){
        logger.info("Message : "+text);
        return text;
    });
};

inventory.prototype.getTextOrderNumberDeleteOrderSubmittedModal = function()
{
    return element(by.css(this.deleteOrderSubmittedModalOrderNumberTextCss)).getText().then(function(text){
        logger.info("Order number : "+text);
        return text;
    });
};

inventory.prototype.getTextOrderedDateDeleteOrderSubmittedModal = function()
{
    return element(by.css(this.deleteOrderSubmittedModalOrderDateTextCss)).getText().then(function(text){
        logger.info("Ordered Date : "+text);
        return text;
    });
};

inventory.prototype.clickdeleteServiceModalNotificationBoxClose = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteServiceModalNotificationBoxCloseCss))), 5000);
   	element(by.css(this.deleteServiceModalNotificationBoxCloseCss)).click();
   	util.waitForAngular();
};

inventory.prototype.isPresentdeleteServiceModalNotification = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteServiceModalNotificationBoxCss))), 5000);
   	element(by.css(this.deleteServiceModalNotificationBoxCss)).isPresent();
   	util.waitForAngular();
	return element(by.css(this.deleteServiceModalNotificationBoxCss)).isPresent();
};

inventory.prototype.clickdeleteServiceConfirmDialogCancelButton = function(){
	browser.wait(EC.elementToBeClickable(element(by.css(this.deleteserviceCancelCss))), 5000);
   	element(by.css(this.deleteserviceCancelCss)).click();
   	util.waitForAngular();
};


//****************FUNCTIONS IN DELETE ORDER SUBMITTED POP UP END************************


//**************** START : FUNCTIONS FOR D2OP (TURN ON, TURN OFF, REBOOT) OF INSTANCES***********


inventory.prototype.clickOverflowActionButtonForPowerStates = function()
{   
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.powerStateOverflowMenuIconXpath))), 60000);
    return element(by.xpath(this.powerStateOverflowMenuIconXpath)).click();
};

inventory.prototype.clickTurnONButtonOfInstance = function()
{ 	//browser.ignoreSynchronization = true;
	//browser.waitForAngular();
	util.waitForAngular();
	browser.sleep(4000);	//Adding hardcoded wait since TurnOn options takes time to load
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextTurnON))), 120000);
   	return element(by.buttonText(this.buttonTextTurnON)).click().then(function(){
		logger.info('Clicked on Turn ON button');
	});
};

inventory.prototype.clickOkForInstanceTurnONPermission = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.turnONInstanceOkButtonCss))),9000);
	return element(by.css(this.turnONInstanceOkButtonCss)).click().then(function(){
		logger.info('Clicked on Ok button for Turn ON');
	});
};

inventory.prototype.clickTurnOFFButtonOfInstance = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextTurnOFF))), 120000);
   	return element(by.buttonText(this.buttonTextTurnOFF)).click().then(function(){
		logger.info('Clicked on Turn OFF button');
	});
};

inventory.prototype.clickOkForInstanceTurnOFFPermission = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.turnOFFInstanceOkButtonCss))),9000);
	return element(by.css(this.turnOFFInstanceOkButtonCss)).click().then(function(){
		logger.info('Clicked on Ok button for Turn OFF');
	});
};

inventory.prototype.clickRebootButtonOfInstance = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextReboot))), 120000);
   	return element(by.buttonText(this.buttonTextReboot)).click().then(function(){
		logger.info('Clicked on Reboot button');
	});
};

inventory.prototype.clickOkForInstanceRebootPermission = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.visibilityOf(element(by.css(this.rebootInstanceOkButtonCss))),9000);
	return element(by.css(this.rebootInstanceOkButtonCss)).click().then(function(){
		logger.info('Clicked on Ok button for Reboot');
	});
};

inventory.prototype.getComponentTags = function()
{ 	
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	var eleCompTag = element(by.xpath('//tr[@class="bx--table-row bx--parent-row bx--table-row--sub-row"]/td[6]'));
	browser.wait(EC.visibilityOf(eleCompTag),40000);
	return eleCompTag.getText().then(function(text){
		logger.info('Service Components are ' + text);
		logger.info('Dummy adapter : ' + text.split(",")[0] + "}");
		return text.split(",")[0] + "}";
	});
};

inventory.prototype.waitForInstancStateStatusChange = function(orderObject, expectedChangedStatus, repeatCount) {
	let self = this;
	browser.ignoreSynchronization = true;
	if (repeatCount == undefined) {
        	repeatCount = 12;
    	}
	browser.waitForAngular();
	browser.sleep(10000);
	this.clickExpandFirstRow();
	browser.sleep(3000);	
	
	if (repeatCount > 0) {
		return this.clickExpandFirstRow().then(function(){
			browser.ignoreSynchronization = true;
			browser.waitForAngular();
			browser.wait(EC.elementToBeClickable(element(by.xpath('(//*[@class="bx--overflow-menu__icon"])[3]'))), 60000).then(function(){
				//browser.wait(EC.visibilityOf(element(by.xpath('(//*[@class="bx--table-column" and ../@class="bx--table-row bx--parent-row bx--table-row--sub-row bx--parent-row--even"])[3]'))), 30000).then(function(){
				//element(by.xpath('(//*[@class="bx--table-column" and ../@class="bx--table-row bx--parent-row bx--table-row--sub-row bx--parent-row--even"])[3]')).getText().then(function(text){
				//var statusElemXpath = element(by.xpath('//tr[@class="bx--table-row bx--parent-row bx--table-row--sub-row"]/td[5]'));							
				var statusElemXpath = element(by.xpath('(//tr[@class="bx--table-row bx--parent-row bx--table-row--sub-row"]/td)[5]'));
				browser.wait(EC.visibilityOf(statusElemXpath), 60000).then(function(){
					statusElemXpath.getText().then(function(text){		
						logger.info("Current Status:"+text);	
						if(text == expectedChangedStatus){
							logger.info("Instance Status is changed to: "+text);
							repeatCount = 0;
							return text;
						}else{
							browser.waitForAngular();
							browser.sleep(5000);
							logger.info("Status Check - " + repeatCount + " : Waiting for instance status to be "+expectedChangedStatus+", current status: "+text);						
							repeatCount = repeatCount - 1;
							self.waitForInstancStateStatusChange(orderObject, expectedChangedStatus, repeatCount);
						}	
					});
				});
			});
		}); 
		
	}
	
};

inventory.prototype.getInstancePowerStateStatus=function(orderObject) {
	this.searchOrderByServiceName(orderObject.servicename);
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	var statusElemXpath = element(by.xpath('(//tr[@class="bx--table-row bx--parent-row bx--table-row--sub-row"]/td)[5]'));
	this.clickExpandFirstRow().then(function(){
		browser.ignoreSynchronization = true;
		browser.waitForAngular();
		browser.wait(EC.elementToBeClickable(element(by.xpath('(//*[@class="bx--overflow-menu__icon"])[3]'))), 60000).then(function(){
			browser.wait(EC.visibilityOf(statusElemXpath), 60000);
		});
	});	
	//return element(by.xpath('(//*[@class="bx--table-column" and ../@class="bx--table-row bx--parent-row bx--table-row--sub-row bx--parent-row--even"])[3]')).getText();
	return statusElemXpath.getText();
};

inventory.prototype.clickViewComponentofAWSInstance = function()
{ 	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextViewComponent))), 8000);
   	return element(by.buttonText(this.buttonTextViewComponent)).click().then(function(){
		logger.info('Clicked on View Component button');
	});
};

//**************** STOP : FUNCTIONS FOR D2OP (TURN ON, TURN OFF, REBOOT) OF INSTANCES***********

//***************************************AZURE VM state Function starts**********************************
//Function for Azure VM State Check
inventory.prototype.waitForAzInstancStateStatusChange = function(orderObject, expectedChangedStatus) {
	let self = this;
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
	browser.sleep(10000);
        browser.executeScript('window.scrollTo(0,0);');
	this.clickExpandFirstRow();
	browser.sleep(3000);
	this.clickExpandFirstRow().then(function(){
		browser.ignoreSynchronization = true;
		browser.waitForAngular();
		browser.wait(EC.elementToBeClickable(element(by.xpath(self.azurePowerStateOverflowMenuIconXpath))), 60000).then(function(){
			browser.wait(EC.visibilityOf(element(by.xpath(self.azVMStatus))), 30000).then(function(){
				element(by.xpath(self.azVMStatus)).getText().then(function(text){
				logger.info("Current Status:"+text);	
				if(text == expectedChangedStatus){
					logger.info("Instance Status is changed to: "+text);
					return text;
				}else{
					browser.waitForAngular();
					browser.sleep(5000);
					self.waitForAzInstancStateStatusChange(orderObject, expectedChangedStatus);
					logger.info("Waiting for instance status to be "+expectedChangedStatus+", current status: "+text);
				}	
				});
			});
		});
	}); 
	return element(by.xpath(self.azVMStatus)).getText();
};

//Function for clicking on Azure VM's available operations
inventory.prototype.clickOverflowActionButtonForPowerStatesAz = function()
{
        browser.ignoreSynchronization = true;
        browser.waitForAngular();
        browser.wait(EC.elementToBeClickable(element(by.xpath(this.azurePowerStateOverflowMenuIconXpath))), 60000);
    return element(by.xpath(this.azurePowerStateOverflowMenuIconXpath)).click();
};

//Function for Turn Off Azure VM
inventory.prototype.azClickTurnOFFButtonOfInstance = function()
{
        browser.ignoreSynchronization = true;
        browser.waitForAngular();
        browser.wait(EC.elementToBeClickable(element(by.xpath(this.azTurnOFFXpath))), 10000);
        return element(by.xpath(this.azTurnOFFXpath)).click().then(function(){
                logger.info('Clicked on Turn OFF button');
        });
};

//Function for Turn On Azure VM
inventory.prototype.azClickTurnONButtonOfInstance = function()
{
        browser.ignoreSynchronization = true;
        browser.waitForAngular();
        browser.wait(EC.elementToBeClickable(element(by.xpath(this.azTurnONXpath))), 10000);
        return element(by.xpath(this.azTurnONXpath)).click().then(function(){
                logger.info('Clicked on Turn ON button');
        });
};

//Function for Reboot Azure VM
inventory.prototype.azClickRebootButtonOfInstance = function()
{
        browser.ignoreSynchronization = true;
        browser.waitForAngular();
        browser.wait(EC.elementToBeClickable(element(by.xpath(this.azRebootXpath))), 10000);
        return element(by.xpath(this.azRebootXpath)).click().then(function(){
                logger.info('Clicked on Reboot button');
        });
};

//***************************************AZURE VM state Function Ends**********************************

//This function is used to call import API and return response of it
inventory.prototype.callImportAPI = function(){
	return "response"
}

inventory.prototype.isExistsFirstChildComponent = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.sOCFirstChildComponentXpath))), 5000);
   	element(by.xpath(this.sOCFirstChildComponentXpath)).isPresent().then(function(present) {
    	return present
	});
};

inventory.prototype.iscomponentTypePropAvailable = function()
{
	element(by.xpath(this.componentTypePropXpath)).isPresent().then(function(present) {
    	return present
	}); 
};

inventory.prototype.clickTurnOffActionMenuOption = function()
{
	element(by.css(this.turnOffActionMenuOptionCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickTurnOffOakybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.turnOffserviceOkayCss))), 5000);
   	return element(by.css(this.turnOffserviceOkayCss)).click();
};

inventory.prototype.clickTurnOnActionMenuOption = function()
{
	element(by.css(this.turnOnActionMenuOptionCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickTurnOnOakybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.turnOnserviceOkayCss))), 5000);
   	return element(by.css(this.turnOnserviceOkayCss)).click();
};

inventory.prototype.clickRebootActionMenuOption = function()
{
	element(by.css(this.RebootActionMenuOptionCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickRebootOakybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.rebootserviceOkayCss))), 5000);
   	return element(by.css(this.rebootserviceOkayCss)).click();
};

inventory.prototype.clickAccessComponentActionMenuOption = function()
{
	element(by.xpath(this.accessComponentActionMenuOptionXpath)).click();
	util.waitForAngular();
};

inventory.prototype.clickRefreshStatusActionMenuOption = function()
{
	element(by.xpath(this.refreshStatusActionMenuOptionXpath)).click();
	util.waitForAngular();
};

inventory.prototype.clickRefreshStatusOakybutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.css(this.refreshStatusOkayCss))), 5000);
   	return element(by.css(this.refreshStatusOkayCss)).click();
};

inventory.prototype.clickRefreshStatusOKbutton = function()
{
	browser.wait(EC.elementToBeClickable(element(by.xpath(this.refreshStatusOkXpath))), 5000);
   	return element(by.xpath(this.refreshStatusOkXpath)).click();
};

inventory.prototype.getDeleteOrderNumber = function()
{
	browser.wait(EC.visibilityOf(element(by.xpath(this.deleteServiceInfoTooltipXpath))), 120000).then(function(){
		logger.info("Waited till Delete Service Info tool tip appears");		
	});
	
	return element(by.xpath(this.deleteOrderNumberXpath)).getText().then(function(text){
		var deleteOrderNumber = text.toString().split(":")[1];
		logger.info("Delete Order Number:"+deleteOrderNumber.trim());
		return deleteOrderNumber.trim();
	});	
};

inventory.prototype.selectOptionsMenu = function(index)
{      
       var optionsIndexXpath = "//*[@id='carbon-deluxe-data-table-0-parent-row-1-child-row-"+index+"-overflow-menu-icon']"
       console.log("indexXapth = " + optionsIndexXpath)
       browser.wait(EC.elementToBeClickable(element(by.xpath(optionsIndexXpath))), 5000);
       return element(by.xpath(optionsIndexXpath)).click();
}
inventory.prototype.clickViewComponent = function(index)
{
	   var viewComponentIndexCss = "#carbon-deluxe-data-table-0-parent-row-1-child-row-"+index+"-option-5-button"
       browser.wait(EC.elementToBeClickable(element(by.css(this.viewComponentIndexCss))), 5000);
       return element(by.css(this.viewComponentIndexCss)).click();
}
inventory.prototype.getMachineName = function(machineNameFromAPI)
{      
       return element(by.xpath(this.machineNameXpath)).getAttribute("value").then(function(value) {
               console.log("MachineNameFromUI: " + value);
               expect(value).toEqual(machineNameFromAPI);
       });
}       
inventory.prototype.getserviceInstanceName = function()
{
	 return element(by.xpath(this.serviceInstanceNameXpath)).getText().then(function(arr){
		var serviceName = ""
		for (var i=0;i<arr.length;i++){
			serviceName = serviceName+arr[i]
		}
		return serviceName;
	  	})
	
}

inventory.prototype.getCPUConfigValue = function()
{
	 return element(by.xpath(this.cpuConfigXpath)).getText().then(function(arr){
		var cpuConfig = ""
		for (var i=0;i<arr.length;i++){
			cpuConfig = cpuConfig+arr[i]
		}
		return cpuConfig;
	  	})
	
}

inventory.prototype.clickSliderCloseIcon = function()
{
    browser.wait(EC.elementToBeClickable(element(by.css(this.sliderCloseIconCss))), 5000);
    return element(by.css(this.sliderCloseIconCss)).click();
	
}

inventory.prototype.clickViewComponentSliderCloseButton = function()
{
    browser.wait(EC.elementToBeClickable(element(by.css(this.viewComponentSliderCloseButtonXpath))), 5000);
    return element(by.css(this.viewComponentSliderCloseButtonXpath)).click();
	
}

inventory.prototype.clicksocFirstChildGlificon = function()
{
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.socFirstChildGlificonXpath))), 5000);
    return element(by.xpath(this.socFirstChildGlificonXpath)).click();
}

inventory.prototype.clicksocSecondChildGlificon = function()
{
	browser.ignoreSynchronization = true;
	browser.waitForAngular();
    browser.wait(EC.elementToBeClickable(element(by.xpath(this.socSecondChildGlificonXpath))), 5000);
    return element(by.xpath(this.socSecondChildGlificonXpath)).click();
}

inventory.prototype.verifySOC = function()
{
	var compType =  element(by.xpath(this.componentTypeXpath)).getAttribute('innerText').then(function(arr){
		var componentType = ""
		for (var i=0;i<arr.length;i++){
			componentType = componentType+arr[i]
		}
		if ((componentType.toString()).indexOf("Infrastructure.Network.Network.Existing") >=0){
			 console.log ("Component Type : " + componentType)
			 
		}else if ((componentType.toString()).indexOf("Virtual Machine") >=0){
			 console.log ("Component Type : " + componentType)
		}
		return componentType;
	  	})
	 
	
}



inventory.prototype.getRefreshStatusDialogConfirmText = function()
{
	 return element(by.xpath(this.refreshStatusDialogConfirmTextXpath)).getText().then(function(arr){
		var confirmText = ""
		for (var i=0;i<arr.length;i++){
			confirmText = confirmText+arr[i]
		}
		return confirmText;
	  	})
}

inventory.prototype.getsoiStatus = function()
{
	 return element(by.xpath(this.soiStatusXpath)).getText().then(function(arr){
		var status = ""
		console.log("array length")
		console.log(arr.length)
		for (var i=0;i<arr.length;i++){
			status = status+arr[i]
		}
		return status;
	  	})
}

inventory.prototype.findisVM = function(){
	
	this.clicksocFirstChildGlificon();
	util.waitForAngular();
	this.clickViewComponentActionMenuOption();
	var compType =  element(by.xpath(this.componentTypeXpath)).getAttribute('innerText').then(function(arr){
		var componentType = ""
		for (var i=0;i<arr.length;i++){
			componentType = componentType+arr[i]
		}
		if ((componentType.toString()).indexOf("Infrastructure.Network.Network.Existing") >=0){
			 console.log ("Component Type : " + componentType)
			 console.log ("Selecting VM component next to perform operations")
			 isVM = false
		}else if ((componentType.toString()).indexOf("Virtual Machine") >=0){
			 console.log ("Component Type : " + componentType)
			 isVM = true
		}
		console.log("inner loop isvm")
		console.log(isVM)
		return isVM;
	 })
	 
	 return protractor.promise.all([compType]).then(function (values) {
		 console.log("isvm")
		 console.log(isVM)
		 return isVM
		});
}

inventory.prototype.testRebootFirst = function(){
	console.log("calling second second")
	browser.sleep(3000);
	element.all(by.css(this.viewComponentSliderCloseButtonCss)).get(1).click();
	browser.sleep(3000);
	logger.info("Clicked on slider close button");
	
	//Verify reboot
	element(by.xpath(this.socFirstChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on first child Glificon button");
	element(by.css(this.RebootActionMenuFirstOptionCss)).click()
	browser.sleep(3000);
	logger.info("Clicked on Reboot action button");
	element(by.css(this.rebootserviceOkayCss)).click()
	logger.info("Clicked on Reboot OK button in Confirmation dialog");
	this.verifyActionStatusRebootFirst(60)
	
}
inventory.prototype.testRebootSecond = function(){
	console.log("calling second second")
	browser.sleep(3000);
	element.all(by.css(this.viewComponentSliderCloseButtonCss)).get(1).click();
	browser.sleep(3000);
	logger.info("Clicked on slider close button");
	
	//Verify reboot
	element(by.xpath(this.socSecondChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on second child Glificon button");
	element(by.css(this.RebootActionMenuSecondOptionCss)).click()
	browser.sleep(3000);
	logger.info("Clicked on Reboot action button");
	element(by.css(this.rebootserviceOkayCss)).click()
	logger.info("Clicked on Reboot OK button in Confirmation dialog");
	this.verifyActionStatusRebootSecond(60)
	
}

inventory.prototype.testTurnOffFirst = function(){
	console.log("calling second second")
	browser.sleep(8000);
	
	//Verify turn off
	element(by.xpath(this.socFirstChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on first child Glificon button");
	element(by.css(this.turnOffActionMenuFirstOptionCss)).click()
	browser.sleep(3000);
	logger.info("Clicked on Turn Off action button");
	element(by.css(this.turnOffserviceOkayCss)).click()
	logger.info("Clicked on Turn Off OK button in Confirmation dialog");
	this.verifyActionStatusTurnOffFirst(60)
	
}

inventory.prototype.testTurnOffSecond = function(){
	console.log("calling second second")
	browser.sleep(8000);
	
	//Verify turn off
	element(by.xpath(this.socSecondChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on second child Glificon button");
	element(by.css(this.turnOffActionMenuSecondOptionCss)).click()
	browser.sleep(3000);
	logger.info("Clicked on Turn Off action button");
	element(by.css(this.turnOffserviceOkayCss)).click()
	logger.info("Clicked on Turn Off OK button in Confirmation dialog");
	this.verifyActionStatusTurnOffSecond(60)
	
}

inventory.prototype.testTurnOnFirst = function(){
	console.log("calling second second")
	browser.sleep(20000);
	
	//Verify turn on
	element(by.xpath(this.socFirstChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on first child Glificon button");
	element(by.css(this.turnOnActionMenuFirstOptionCss)).click()
	browser.sleep(3000);
	logger.info("Clicked on Turn On action button");
	element(by.css(this.turnOnserviceOkayCss)).click()
	logger.info("Clicked on Turn On OK button in Confirmation dialog");
	this.verifyActionStatusTurnOnFirst(60)
	
}

inventory.prototype.testTurnOnSecond = function(){
	console.log("calling second second")
	browser.sleep(25000);
	
	//Verify turn on
	element(by.xpath(this.socSecondChildGlificonXpath)).click()
	browser.sleep(3000);
	logger.info("Clicked on second child Glificon button");
	element(by.css(this.turnOnActionMenuSecondOptionCss)).click(),
	browser.sleep(3000);
	logger.info("Clicked on Turn On action button");
	element(by.css(this.turnOnserviceOkayCss)).click()
	logger.info("Clicked on Turn On OK button in Confirmation dialog");
	this.verifyActionStatusTurnOnSecond(60)
	
}

inventory.prototype.getsocStatusFirst = function(){
	return element(by.xpath(this.socStatusFirstXpath)).getText().then(function(text){
		actstatus = text;
		return text
	})
}

inventory.prototype.getsocStatusSecond = function(){
	return element(by.xpath(this.socStatusSecondXpath)).getText().then(function(text){
		actstatus = text;
		return text
	})
}

inventory.prototype.verifyActionStatusRebootFirst =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusFirst().then(function(values){
			if (values.toString().indexOf("Rebooting")>=0){
//				console.log("Rebooting.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusRebootFirst(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
}

inventory.prototype.verifyActionStatusRebootSecond =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusSecond().then(function(values){
			
			if (values.toString().indexOf("Rebooting")>=0){
//				console.log("Rebooting.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusRebootSecond(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
}

inventory.prototype.verifyActionStatusTurnOffFirst =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusFirst().then(function(values){
			
			if (values.toString().indexOf("TurningOff")>=0){
//				console.log("Turning Off.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusTurnOffFirst(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
	
}

inventory.prototype.verifyActionStatusTurnOffSecond =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusSecond().then(function(values){
			
			if (values.toString().indexOf("TurningOff")>=0){
//				console.log("Turning Off.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusTurnOffSecond(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
}

inventory.prototype.verifyActionStatusTurnOnFirst =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusFirst().then(function(values){
			
			if (values.toString().indexOf("TurningOn")>=0){
//				console.log("Turning On.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusTurnOnFirst(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
	
}

inventory.prototype.verifyActionStatusTurnOnSecond =  function(repeatCount){
	var brk = 0
	repeatCount = repeatCount-1;
	
	if(repeatCount>0 && (brk == 0)){
		this.getsocStatusSecond().then(function(values){			
			if (values.toString().indexOf("TurningOn")>=0){
//				console.log("Turning On.... Breaking the loop")
				brk = 1
			}else{
				browser.sleep(3000);
				console.log(repeatCount)
				brk = 0
			}	
		})
		
		if (brk == 0){
			this.verifyActionStatusTurnOnSecond(repeatCount);
		}else{
			return;
		}
	}else{
		console.log("repeat count incorrect")
	}
	
}

//Additional Details Section

inventory.prototype.getTextBasedOnLabelName = function (labelName) {
	var latelTextElement = element(by.xpath("//span[contains(text(), '" + labelName + "')]/following-sibling::span"));
	browser.wait(EC.visibilityOf(latelTextElement), 60000);
	return latelTextElement.getText().then(function (text) {
		logger.info("The value for " + labelName + " is : " + text)
		return text;
	});
};  

//****************** Accounts functions ************

inventory.prototype.clickUserIcon = function () {
	return element(by.css(this.userIconCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickAccountsMenuItem = function () {
	return element(by.css(this.accountsMenuItemCss)).click();
	util.waitForAngular();
};

inventory.prototype.clickEditInstance = function () {
	var curr = this;
	return element.all(by.css(this.instanceTableActionIconCss)).first().click().then(function () {
		logger.info("Clicked on the Actions icon from the first row on Inventory page");
		browser.wait(EC.elementToBeClickable(element(by.buttonText(curr.buttonTextEditService))), 120000);
		return element(by.buttonText(curr.buttonTextEditService)).click().then(function () {
			logger.info("Clicked on Edit Service button");
			util.waitForAngular();
			browser.wait(EC.visibilityOf(element(by.buttonText('Next'))),30000);

		});
		
	});
};

inventory.prototype.clickOverflowActionButtonForAddRecordSet = function()
{   
	util.waitForAngular();	
	var elemToClick = element.all(by.css(this.instanceTableActionIconCss));
	browser.wait(EC.elementToBeClickable(elemToClick.last(), 30000));
		
	return elemToClick.last().click().then(function () {
		logger.info("Succesfully clicked on Action button for Recordset option");
		util.waitForAngular();		
	});
};

inventory.prototype.clickAddRecordSet = function(){	
	browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextAddRecordSet))), 30000);
   	return element(by.buttonText(this.buttonTextAddRecordSet)).click().then(function(){
		logger.info('Clicked on Add Recordset button');
		util.waitForAngular();
		browser.wait(EC.visibilityOf(element(by.buttonText('Next'))),40000);
	});
};

inventory.prototype.fillDnsRecordSetDetails = function(){	
	
	browser.wait(EC.elementToBeClickable(element(by.css('input#text-input-dnsName'), 50000)));
   	element(by.css('#text-input-dnsName')).sendKeys("auto-qa-test").then(function(){
		logger.info('DNS Name is succesfully entered');
	});	

	element(by.css('#text-input-ttl')).sendKeys("2").then(function(){
		logger.info('TTL is succesfully entered');
	});
	
	element(by.css('#text-input-ipv4_address')).sendKeys("192.168.22.10").then(function(){
		logger.info('IPv4 Address is succesfully entered');
	});
	//Click on Next button
	element(by.buttonText('Next')).click().then(function(){
		logger.info("Succesfully filled details for DNS Recordset")
		util.waitForAngular();	
	});
    
};
inventory.prototype.clickNextButton = function()
{
	browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(element(by.buttonText(this.buttonTextNext))), 50000);
    element(by.buttonText(this.buttonTextNext)).click().then(function(){
    	logger.info("Clicked on Main Parameters Next button");
    });
};
module.exports = inventory;
