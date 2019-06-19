module.exports = {
	CREATE_SERVICE_REQUEST_URL: "/meaweb/es/ITDCLDSYSTEM/ITD_PMSCSUBMITWF",
	FETCH_SERVICEREQUEST_NUMBER_URL: "/maxrest/rest/mbo/SR?_format=json&_compact=true&_maxItems=10&_includecols=TICKETID&EXTERNALSYSTEM=EXTERNALSERVICEDESK&EXTERNALSYSTEM_TICKETID=",
	FETCH_WORK_ORDER_NUMBER_URL: "/maxrest/rest/mbo/WORKORDER?_format=json&_compact=true&_maxItems=10&_includecols=WONUM&origrecordid=",
	FETCH_WORK_ORDER_TASK_NUMBER_URL: "/maxrest/rest/os/ITDWOTASK?parent==",
	UPDATE_SERVICEREQUEST_URL: "/meaweb/es/ITDCLDSYSTEM/ITDWOTASKSTATUS",
	ICD_OFFERING_ID: "LBGCCP1302",
	TOPICNAME: "orderstatustracking",
	ROUTINGKEY: "orderstatustrackingresponse",
	IB_PULISH_HOST: "",
	credentialObject: {
		endpoint_url: "http://10.155.182.153:9080",
		username: "maxadmin",
		password_fields: {
			password: "kyJ.f~f.2"
		}
	},
	setIcdFlagTrue: {
		"host": "cb-qa-6-api.gravitant.net",
		"path": "/api/orders/setconfig",
		"data": {
			"order_service": {
				"EXTERNAL_ORDER_TRACKING_ENABLE": "True",
				"ORDER_STATUS_TRACKING_PROVIDER_CODE": "ICD",
				"ROUTING_KEY": "ICD"
			}
		}
	}
}