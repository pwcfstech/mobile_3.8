define(function(require, exports, module) {
	'use strict';

	exports.idfcConstants = {

	    /*mVisa - Taral soni */
       MVISA_MIN_TXN_AMOUNT: 1,
       MVISA_MAX_TXN_AMOUNT: 999999.99,
       MVISA_MIN_TIP_AMOUNT: 1,
       MVISA_MAX_TIP_AMOUNT:9999.99,
       MVISA_MIN_REMARKS_LENGTH: 3,
       MVISA_MAX_REMARKS_LENGTH: 999,

       MVISA_MAX_BILL_LENGTH: 26,
      MVISA_MIN_BILL_LENGTH: 1,
      MVISA_MIN_MOB_LENGTH: 10,
      MVISA_MAX_MOB_LENGTH: 10,
      MVISA_MIN_LOYALTY_LENGTH: 1,
      MVISA_MAX_LOYALTY_LENGTH: 26,
      MVISA_MIN_REF_LENGTH: 1,
      MVISA_MAX_REF_LENGTH: 26,

      MVISA_MIN_CONSUMER_LENGTH: 1,
      MVISA_MAX_CONSUMER_LENGTH: 26,
      MVISA_MIN_TERMINAL_LENGTH: 1,
      MVISA_MAX_TERMINAL_LENGTH: 26,
      MVISA_MAX_ADDITIONAL_DP: 2,
       /*mVisa - Taral soni */

		UCIC_LENGTH: 50,
		DEBIT_CARD_LENGTH: 16,
		DEBIT_CARD_CVV_LENGTH: 3,
		ACCOUNT_NUMBER_LENGTH: 11,
		LOAN_ACCOUNT_NUMBER_LENGTH: 14,
		ERR_NO_MOBILE_REGISTERED: 'We don\'t have a mobile number for you. Please register a mobile number with IDFC',
		OTP_SUCCESS_MESSAGE: 'OTP has been successfully sent to your registered mobile number',
		DAYS_IN_MONTH: 30,
		MINIMUM_MONTH_TRANSACTION: 6,


		BENEFICIARY_IDFC_ACCOUNT_LENGTH: 30,
		BENEFICIARY_NONIDFC_ACCOUNT_LENGTH: 30,
		BENEFICIARY_OWN_BANK_NAME: 'IDFC Bank',
		ERR_INVALID_OPERATION: 'Invalid Operation',

		FT_RTGS_AMOUNT_LIMIT: 200000,
		FT_IMPS_AMOUNT_LIMIT: 200000,
		FT_RADIO_IMPS: 'IMPS',
		FT_RADIO_RTGS: 'RTGS',
		FT_TXNMODE_IFT: 'IFT',
		FT_TXNMODE_STO: 'STO',
		FT_NEWBENEFICIARY_LIMIT: 25000,
		FT_ADDED_BENEFICIARY_WITHIN24_LIMIT: 200000,
		FT_ONEDAY_HRS: 24,
		FT_AMOUNT_LIMIT: 1000000,
		FT_INTERNAL_AMOUNT_LIMIT: 2000000,
		MIN_TRANSFER_AMT: 1,
		//FFT_AMT_VALID_MSG: 'Amount cannot be more than 10,00,000',
		FFT_AMT_VALID_MSG: 'Sorry! Cannot proceed with the transaction as it exceeds the maximum limit allowed through Internet Banking or Mobile App',
		FFT_ZERO: '0',
		FFT_WEEKLY: 'WEEKLY',
		FFT_MONTHLY: 'MONTHLY',
		FFT_YEARLY: 'YEARLY',
		FFT_QUARTERLY: 'QUARTERLY',
		FFT_HALF_YEARLY: 'HALF YEARLY',
		FFT_D: 'D',
		FFT_M: 'M',
		FFT_UPDT_MSG: 'Your Transaction is completed successfully!',
		FFT_OK: 'OK',
		FFT_IFT: '000900',
		FFT_EXT: '000902',
		SERVICE_ERROR: 'Service is temporary unavailable, please try later.',
		//AMTMAXERROR: 'Amount cannot be more than 10,00,000',
		//AMTINTMAXERROR: 'Amount cannot be more than 20,00,000',
		//DAILYONETIMELIMITERROR: 'That\'s more than you have allowed yourself to do in a single day. Please change the limit.',
		AMTMAXERROR: 'Sorry! Cannot proceed with the transaction as it exceeds the maximum limit allowed through Internet Banking or Mobile App',
        AMTINTMAXERROR: 'Sorry! Cannot proceed with the transaction as it exceeds the maximum limit allowed through Internet Banking or Mobile App',
		DAILYONETIMELIMITERROR: 'Sorry! Cannot proceed with the transaction as it exceeds the daily limit set by you. Kindly click on Limit Management Tab in case you want to change the limits.',
		ACCTDORMANT: 'DORM',
		IDFC_LTD: 'IDFC LIMITED',
		NEFT_MSG: 'NEFT transactions can be done from 08:00 AM to 06:30 PM (except Sundays and Bank holidays)',
		IMPS_MSG: 'IMPS service is available 24X7, throughout the year including Sundays & Bank holidays',
		RTGS_MSG: 'RTGS transactions can be done from 09:00AM to 04:00PM (except Sundays and Bank holidays)',
		RTGS_MSG_MIN: 'Minimum daily transfer limit : Rs 2 lakhs',
		RTGS_MSG_MAX:'Maximum daily transfer limit : Rs 20 lakhs',

		LIMIT_MAXAMOUNT: 2000000,
		LIMIT_MIN: -1,
		TD_MAXDEPOSITAMT: 9999999,
		TD_DEP_AMOUNT_LIMIT: 49999,
		TD_NOOFDAYSINYEAR: 365,
		TD_MINOR_AGE: 18,
		TD_MINDEPOSITAMT: 10000,
		TD_INTERESTRATEURL: './static/launchpad/banking/widgets/open-deposits/partials/InterestRate.html',
		TAXSAVER_YEARS: 5,
		TAXSAVER_DAYS: 0,
		TAXSAVER_MAXDEPAMT: 150000,
		TD_RENEW_MSG: 'Your Fixed Deposit has been renewed.',
		FRGT_PWD_MAX_INVALID_ATEMPT_ERRMSG: 'Exceeded maximum attempts for password reset.',
		FRGT_PWD_MAX_INVALID_ATEMPT_COUNT: 5,
		FRGT_PWD_ERR_CODE_INVALID_USERNAME: 'CHP01',

		CONTACTUS_URL: './static/launchpad/universal/widgets/navfooter/ConnectWithUs.html',
		CUSTOMERCARE_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		ABOUT_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		CAREERS_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		INVESTORRELATION_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		GROUP_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		CSR_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		NOTICEBOARD_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		SAFEBANKING_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		INITIATIVE_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		RATESANDCHARGES_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		TERMSANDCONDITIONS_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		TOOLSANDCALCULATOR_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		FORMCENTER_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		REGULATORYDISCLOSURE_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		DND_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		FAQ_URL: './static/launchpad/universal/widgets/navfooter/FAQs.html',
		DISCLAIMER_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		PRIVACY_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',
		SITEMAP_URL: 'http://10.5.4.74:7001/content/idfc/contact.html',

		/* Loan Summary Start*/
        TECHNICAL_ERROR: 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
        TECHNICAL_ERROR_LOAN_DETAILS: 'Sorry, Our machines are not talking to each other! Please try in a while.',
        ERROR_NO_LOANS: 'You have no loans from us',
        /* Loan Summary End*/


        /* loan interst certificate */
        ERROR_FIN_MSG : 'You missed selecting Loan Financial Year',
        ERROR_ACC_MSG :'Please select the Loan Account Number to view the Interest Certificate',
        ERROR_ACC_NOTDISB:"Sorry, you have no interest certificate for the year selected. Please select a different year.",
        ERROR_SYS_MSG : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
        ERROR_PDF : 'Sorry, unable to download the certificate. Please try again in some time.',
        ERROR_EMAIL : 'Sorry, we are unable to send your interest certificate. Please try again in some time',
        START_DATE : '01-Apr-',
        END_DATE : '31-Mar-',

       /* loan interst certificate */

        /* Loan Simulator */
        ERROR_FC_SIMULATION : 'We cannot simulate a part pre-payment or foreclosure on a partially disbursed loan. For foreclosure at this stage please contact our Contact Center on 1800-419-4332 or visit our nearest branch.',
        ERROR_PREPAY_SIMULATION : 'We cannot simulate a part pre-payment or foreclosure on a partially disbursed loan. For part pre-payment at this stage please contact our Contact Center on 1800-419-4332 or visit our nearest branch.',
        ERROR_DUE_AMOUNT:'You cannot make a part payment lesser than your current due amount. To simulate a part pre-payment, please enter a value more than current due but less than your total outstanding.',

		/* BIB Changes Start */
		/* Added for Dashboard */
		FORTHCOMING_DUES_MESSAGE: 'No forthcoming dues.What a happy state to be in !',
		SERVICE_REQUEST_MESSAGE: 'No service requests pending',
		SERVICE_REQUEST_MESSAGE_DETAIL: 'Something went wrong with the request no:',
		WITHIN_BANK:'Within Bank',
		NEFT_RTGS:'NEFT/RTGS',
		ACCOUNT_STATUS: 'CLOSED',
        ACCOUNT_CURRENCY: 'INR',
        ACCOUNT_HOLDBAL: '0',
        TD_TAXSAVER_MONTHLY_1A: 'TD_TAXSAVER_MONTHLY_1A',
        TD_TAXSAVER_CUMULATIVE_M: 'TD_TAXSAVER_CUMULATIVE_M',
        TD_TAXSAVER_QUARTERLY_3A: 'TD_TAXSAVER_QUARTERLY_3A',
        TD_TAXSAVER_HALFYEARLY_6A: 'TD_TAXSAVER_HALFYEARLY_6A',
        TD_TAXSAVER_ANNUAL_YA: 'TD_TAXSAVER_ANNUAL_YA',
        REQUEST_CLOSED: 'Closed',
        REQUEST_OPEN: 'Open',
        WITHIN_BANK_CODE: 900,
        NEFT_RTGS_CODE: 902,

		/* Truly One Account -Start */
		TOA_PROFIT_CENTER_CODE_1: '053',
		TOA_PROFIT_CENTER_CODE_2: '056',
		TOA_CA_PRODUCT_TYPE: '1000',
		TOA_PRODUCTTYPE_TRULYONE: '3003',
		TOA_PRODUCTTYPE_REGULAR10K: '3001',
		TOA_PRODUCTTYPE_REGULAR1L: '3002',
		TOA_PRODUCTTYPE_DYNAMIC: '3005',
		TOA_PRODUCTTYPE_DYNAMICPLUS: '3007',
		TOA_PRODUCTTYPE_WORLD: '3004',
		TOA_MOP: 'SINGLY',
		FREQUENCY_1: '01',
		CYCLE_D: 'D',
		SWEEP_TYPE_1: '1',
		SAVINGS_PLUS_FLAG_N: 'N',
		VALUE_TYPE_CA: 'CA',
                VALUE_TYPE_SA: 'SA',
		ITEM_TO_AMEND: '1',
		START_AMEND: '09',
		TOA_CA_PRODUCT_CODE: 'Current Account',
		TOA_SA_PRODUCT_CODE: 'Saving Account',
		TOA_CA_PRODUCT_CODE_ID: '210',
		TOA_SA_PRODUCT_CODE_ID: '211',
		TOA_NOT_ELIGIBLE_APPLY: 'You already have current and savings accounts. You may go ahead to Link them, by clicking Link Accounts.',
		TOA_MAINTAIN_ERROR: 'We have not received any request for change in the Truly One parameters set by you.',
        TOA_APPLY_DOT: '.',
        TOA_APPLY_SUCCESS: 'Your reference number for the Truly one account is ',
        TOA_MAINTAIN_NAME: 'Manage Accounts',
        TOA_DELINK_NAME: 'De-Link Accounts',
        TOA_LINK_NAME: 'Link Accounts',
        TOA_APPLY_NAME: 'Get Started',
        TOA_MAINTAIN_VALUE: 'Manage Accounts',
        TOA_DELINK_VALUE: 'delink',
        TOA_LINK_VALUE: 'link',
        TOA_APPLY_VALUE: 'Get Started',
        TOA_NOT_ELIGIBLE: 'You are not eligible for Truly One Relationship',
        TOA_LINK_ERROR: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us. If you would like to know more or apply for either please reach out to your RM.',
		TOA_APPLY_ERROR: 'You can link only one savings and current account to form a Truly One Account and you already have one. If you would like to know more please feel free to reach out to your RM.',
		TOA_DISP_ACTIVE_N: 'N',
		TOA_DISP_ACTIVE_Y: 'Y',
		TOA_LAST_DATE: '2099-12-31',
		LINK_START_AMEND: '00',
		TOA_SWEEP_NAME: 'Sweeps',
		TOA_UDC_NAME: 'Unified Debit Card',
		TOA_UDC_VALUE: 'udc',
		//SWEEPS_VALIDATION_MESSAGE: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us.If you\\\ 'd like to know more or apply for either please reach out to your RM.',
        TOA_UDC_ERROR: 'Your savings account debit card is in blocked status. Please unblock it online and then retry.',
        TOA_NO_CA_CARD: 'To apply for a unified debit card you need a business debit card linked to your current account. If you would like to know more or apply for either please reach out to your RM.',
        TOA_MULTIPLE_CARDS:'We are unable to proceed with your request as you have multiple debit cards linked to your current account. If you would like to know more please reach out to your RM.',
        TOA_REQUEST_FOR_LINK:'LINK',
        TOA_ACCNT_TYP_PARAM:'11',
        TOA_REQUEST_FOR_DELINK:'DELINK',
        TOA_REQUEST_FRM_UDC:'udc',
		TOA_APPLY_SUBMIT_ERROR:'Sorry, something went wrong, and the lead didnâ€™t get generated. Please try again.',
		TOA_SYSTEM_ERROR:'Sorry, one of our systems is not responding. Please try again in some time',
		TOA_LINK_SUBMIT_ERROR:'Sorry, your accounts have not been linked. Please try again',
		//TOA_SWEEP_SUBMIT_ERROR:'Sweep Not Set Up. Something went wrong. Please try again later.',
		TOA_DELINK_SUBMIT_ERROR:'Something went wrong. Your accounts have not been delinked. Please try again.',
        //DELINK_VALIDATION_MESSAGE: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us. If youâ€™d like to know more or apply for either please reach out to your RM.',

		/* Truly One Account -End */


		/* Truly One Account -End */

					/* Sweeps start */
    	FD_TENURE: 366,
    	MINIMUM_SWEEPOUT_AMOUNT: 10000,
    	THRESHOLD_AMOUNT: 100000,
		THRESHOLD_AMOUNT_2L: 200000,
		BLANK: '', /* frequency */
	 /*     FREQUENCY_1: '1', */
	      	CYCLE_M: 'M',
	    	SAVINGS_PLUS_FLAG_Y: 'Y',
	    	SWEEP_TYPE_2: '2',
		NO_OF_SWEEPS_FOR_SWEEPOUT: '0',
		NO_OF_SWEEPS_FOR_SWEEPIN: '3',
		VALUE_TYPE_ONLN: 'ONLN',
		VALUE_TYPE_PUSH: 'PUSH',
		FREQUENCY_7: '07',


		DELINK_VALIDATION_MESSAGE:"Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us.If you'd like to know more or apply for either please reach out to your RM",
		SWEEP_MANADATE_PRODUCT_TYPE1000 : '1000',
		SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_10K : '3001',
		SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_1LAC : '3002',
		SWEEP_MANADATE_PRODUCT_TYPE_WORLD_BUSINESS : '3004',
		SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_BUSINESS : '3005',
		SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_PLUS : '3007',
		SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_TASC_CA_10K : '3201',
		SWEEP_MANADATE_PRODUCT_DYNAMIC_TASC_CA : '3202',
		SWEEP_MANADATE_PRODUCT_CA_GOVT : '4004',

		SWEEP_MANADATE_PRODUCT_TYPE2000 : '2000',
		SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_TASC_SA_10K : '3201',
		SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_TASC_SA : '3202',
		SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_PLUS_TASC_SA : '3203',
		SWEEP_MANADATE_PRODUCT_SA_GOVT : '4004',
        SWEEP_MANADATE_PRODUCT_SA_KIDS : '1002',
		SWEEP_MANADATE_PRODUCT_SA_KIDS_SELF : '1003',
		SWEEP_MANADATE_PRODUCT_SA_SENIORCITIZEN: '1004',
		/* Sweeps End */

		BIB_ERROR_SYS_MSG : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
		/* BIB Changes End */

		ECOM_ERROR_PAGE : '/checkout_failure',
        IS_FINANCIAL_TRANSACTION : 'N',

        /* Transaction Summary Start */
        TRANSACTION_SUMMARY_STATUS_ID: 'All',
        TRANSACTION_SUMMARY_STATUS_ALL: 'All',
        TRANSACTION_SUMMARY_ACCOUNT_ID: '0',
        TRANSACTION_SUMMARY_ACCOUNT_SELECT: 'Select',
		TRANSACTION_SUMMARY_NO_APPROVED: 'NO_APPROVED',
		TRANSACTION_SUMMARY_NO_INITIATED: 'NO_INITIATED',
		TRANSACTION_SUCCESS: 'Success',
        TRANSACTION_INITIATED: 'Initiated',
         TRANSACTION_REMARK: 'Remarks: ',
         TRANSACTION_FAILED:'Failed',
         TRANSACTION_APH:'Pending For Approval And In Hold',
         TRANSACTION_APR:'Pending For Approval',
         TRANSACTION_Approver_Role:'Pending for approval with: ',
        /* Transaction Summary End */

        /* Interest Letter  Start*/
        INTEREST_LETTER_DOWNLOAD: 'downloadPdf',
        INTEREST_LETTER_EMAIL: 'email',
        INTEREST_LETTER_LOAN_ACCT_TYPE: 'L',
        INTEREST_LETTER_CC_OD_ACCT_TYPE: 'D',
        INTEREST_LETTER_EMAIL_SUCCESS:'Interest letter has been generated and e-mailed at your registered e-mail ID',
        INTEREST_LETTER_NO_EMAIL:'No email id has been set for this account, hence interest letter cannot be emailed. Please contact your relationship manager',
        INTEREST_LETTER_EMAIL_FAILURE:'Sorry, we are unable to send interest letter on e-mail right now. Please try again later.',
        /* Interest Letter  End*/

        /* SSO Start */
        CHILD_SESSION_ALREADY_OPEN: 'Session already open',
        /* SSO End */

        /* Sprint2 end */



		/* BIB Changes End */

	/*PL - LAP */
       ERROR_MISSING_ACC_MSG : 'You missed selecting Loan Account Number.',
       ERROR_MISSING_ST_DATE_MSG :'You must select From date',
       ERROR_MISSING_TO_DATE_MSG :'You must select To date',
       ERROR_MISSING_BOTH_DATES_MSG : 'You missed selecting both the dates',
       ERROR_DATE_COMPARE_MSG : 'Todate cannot be less than FromDate.',
       ERROR_DATE_COMPARE_TO_AND_BUSINESS_MSG : 'Todate cannot be greater than Business date.',
       ERROR_DATE_COMPARE_TO_AND_FROM_MSG : 'From date must be earlier than To date',
       ERROR_ACC_CONTAIN_NULL_DATA_MSG : 'There is no transaction under this loan account.',
       ERROR_SORRY_MSG : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
       ERROR_SEND_RS : 'Sorry, we are unable to send your Repayment Schedule',
       ERROR_GEN_RS : 'Sorry, we are unable to generate your Repayment Schedule',
       ERROR_NO_LAP : 'Sorry !! You have no loan against property accounts with us.',
	ERROR_NO_PL : 'You have no personal loans with us.',
	ERROR_ACC_NULL_DATA_SIXMONTHS_MSG : 'There is no transaction under this loan account in past 6 months.',
	ERROR_ACC_NULL_DATA_SEL_PERIOD_MSG : 'There is no transaction within the period you have selected.',
	ERROR_SEND_SOA : 'Sorry, we are unable to send your Loan Statement',
	ERROR_GEN_SOA : 'Sorry, we are unable to generate your Loan Statement',
	SUCCESS_EMAIL_MSG : 'Email has been sent successfully to your registered email-id',
	ERROR_EMAIL_NOT_REGISTERED_MSG : 'Oops! Looks like you haven’t registered your email ID with us, please add your email ID in the My Profile section or call us on 1800-419-4332 so we can update it for you. We can only send the Advice to your registered  email ID.'



	};

});
