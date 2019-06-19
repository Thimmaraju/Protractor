"use strict";

var req = require('../../../../helpers/icdApiUrl.js'),
	Orders = require('../../../pageObjects/orders.pageObject.js'),
	HomePage = require('../../../pageObjects/home.pageObject.js'),
	DashBoard = require('../../../pageObjects/dashBoard.pageObject.js'),
	CatalogPage = require('../../../pageObjects/catalog.pageObject.js'),
	PlaceOrderPage = require('../../../pageObjects/placeOrder.pageObject.js'),
	util = require('../../../../helpers/util.js'),
	orderFlowUtil = require('../../../../helpers/orderFlowUtil.js'),
	appUrls = require('../../../../testData/appUrls.json'),
	virtualNetworkTemplate = require('../../../../testData/OrderIntegration/Azure/VirtualNetwork.json');

describe('TestCases for Order Tracking ICD', function () {
	var orders, homePage, dashBoard, catalogPage, placeOrderPage, login, srNumber, returnObj, orderObject, serviceName, orderId;
	var modifiedParamMap = {};
	var messageStrings = {
		providerName: 'Azure'
	};

	beforeAll(function () {
		orders = new Orders();
		homePage = new HomePage();
		dashBoard = new DashBoard();
		catalogPage = new CatalogPage();
		placeOrderPage = new PlaceOrderPage();
		browser.driver.manage().window().maximize();
	});

	beforeEach(function () {
		catalogPage.open();
		expect(util.getCurrentURL()).toMatch(appUrls.catalogPageUrl);
		catalogPage.clickProviderCheckBoxBasedOnName(messageStrings.providerName);
		serviceName = "TestAutomation" + util.getRandomString(5);
		modifiedParamMap = { "Service Instance Name": serviceName };
	});

	it('Verify enabling ICD order tracking is working fine - TC C159934 ', function () {
		expect(req.enableIcdOrderTracking()).toMatch('Successfully updated configurations');
	});

	it('Verify whether SR status as "WAPPR(Waiting for Approval)" in ICD portal after creating the order for public provider (ex: Azure) in Consume App ', async function () {
		async function createOrder() {
			orderObject = {};
			catalogPage.clickFirstCategoryCheckBoxBasedOnName('Network');
			catalogPage.clickConfigureButtonBasedOnName(virtualNetworkTemplate.bluePrintName);
			orderObject.servicename = serviceName;
			var resourceGroup = "RGTestauto" + util.getRandomNumber(4);
			var storageAccountName = "teststorage" + util.getRandomNumber(4);
			var resourceGroupMap = {"Service Instance Name":serviceName,"Existing Resource Group List":"","Resource Group Location":"","New Resource Group":resourceGroup,"Create New Virtual Network":"","Select Service Endpoints":"","Services":""};
			orderFlowUtil.fillOrderDetails(virtualNetworkTemplate, resourceGroupMap);
			placeOrderPage.submitOrder();
			orderObject.orderNumber = placeOrderPage.getTextOrderNumberOrderSubmittedModal();
			orderObject.totalPrice = placeOrderPage.getTextTotalPriceOrderSubmittedModal();
			expect(placeOrderPage.getTextOrderSubmittedHeaderOrderSubmittedModal()).toBe('Order Submitted !');
			await placeOrderPage.clickgoToServiceCatalogButtonOrderSubmittedModal();
			var ordernumdDate = orderObject.createdDate;
			browser.sleep(20000);
			var ordernumber = orderObject.orderNumber;
			console.log("Order number after creating an order: ", ordernumber);
			return ordernumber;
		}
		orderId = await createOrder();
		console.log("Order number after async await", orderId);
		var serviceRequestNumber;
		setTimeout(async function () {
			console.log("Order Id inside setTimeOut event :: ", orderId);
			serviceRequestNumber = await req.fetchServiceRequestNumber(orderId);
			console.log("Print SR number: ", serviceRequestNumber);
			let workOrderNumber = await req.fetchWorkOrderNumber(serviceRequestNumber);
			console.log("Print work order number:", workOrderNumber);
			let workOrderTaskStatus = await req.fetchWorkOrderTaskStatus(workOrderNumber);
			console.log("Print work order status:", workOrderTaskStatus);
			expect(req.fetchWorkOrderTaskStatus(workOrderNumber)).toBe('WAPPR');
		}, 10000);
	});


	it('Verify whether SR status as "IN PROG" in ICD portal after approving order for public provider (ex: Azure) in Consume App  ', async function () {
		orders.open();
		await orderFlowUtil.approveOrderWithAsyncAwait(orderObject);
		await orderFlowUtil.waitForOrderStatusChangeWithAsyncAwait(orderObject, 'Provisioning in Progress');
		var serviceRequestNumber;
		setTimeout(async function () {
			console.log("Order Id inside setTimeOut event :: ", orderId);
			serviceRequestNumber = await req.fetchServiceRequestNumber(orderId);
			console.log(serviceRequestNumber);
			var workOrderNumber = await req.fetchWorkOrderNumber(serviceRequestNumber);
			console.log(workOrderNumber);
			var workOrderTaskStatus = await req.fetchWorkOrderTaskStatus(workOrderNumber);
			console.log(workOrderTaskStatus);
			expect(req.fetchWorkOrderTaskStatus(workOrderNumber)).toBe('INPRG');
		}, 10000);
	});

	it('Verify whether SR status as "COMP" in ICD portal after approving order and got provisioned successfully for public provider (ex: Azure) in Consume App  ', async function () {
		orders.open();
		await orderFlowUtil.waitForOrderStatusChangeWithAsyncAwait(orderObject, 'Completed');
		var serviceRequestNumber;
		setTimeout(async function () {
			console.log("Order Id inside setTimeOut event :: ", orderId);
			serviceRequestNumber = await req.fetchServiceRequestNumber(orderId);
			console.log(serviceRequestNumber);
			var workOrderNumber = await req.fetchWorkOrderNumber(serviceRequestNumber);
			console.log(workOrderNumber);
			var workOrderTaskStatus = await req.fetchWorkOrderTaskStatus(workOrderNumber);
			console.log(workOrderTaskStatus);
			expect(req.fetchWorkOrderTaskStatus(workOrderNumber)).toBe('COMP');
		}, 10000);
	});

	it('Verify disabling ICD order tracking is working fine - TC C159934 ', function () {
		expect(req.disableIcdOrderTracking()).toMatch('Successfully updated configurations');

	});

})
