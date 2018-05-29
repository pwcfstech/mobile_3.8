define(function (require, exports) {
    'use strict';

    exports.IdfcConstants = {
        /* GLOBAL CONSTANTS - START */

        UCIC_LENGTH: 50,
        DEBIT_CARD_LENGTH: 16,
        DEBIT_CARD_CVV_LENGTH: 3,
        ACCOUNT_NUMBER_LENGTH: 11,
        LOAN_ACCOUNT_NUMBER_LENGTH: 14,
        ERR_NO_MOBILE_REGISTERED: 'We don\'t have a mobile number for you. Please register a mobile number with IDFC',
        OTP_SUCCESS_MESSAGE: 'OTP has been successfully sent to your registered mobile number',
        DAYS_IN_MONTH: 30,
        MINIMUM_MONTH_TRANSACTION: 6,

        /* GLOBAL CONSTANTS - END */

        /* BENEFICIARY - START */

        BENEFICIARY_IDFC_ACCOUNT_LENGTH: 17,
        BENEFICIARY_NONIDFC_ACCOUNT_LENGTH: 35,
        BENEFICIARY_OWN_BANK_NAME: 'IDFC Bank',
        ERR_INVALID_OPERATION: 'Invalid Operation',
        //BENEFICIARY_COOLING_PERIOD: 30,

        /* BENEFICIARY - END */

        /* FUND Transfer - START */

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
        FFT_AMT_VALID_MSG: 'Amount cannot be more than 10,00,000',
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
        AMTMAXERROR: 'Amount cannot be more than 10,00,000',
        AMTINTMAXERROR: 'Amount cannot be more than 20,00,000',
        DAILYONETIMELIMITERROR: 'That\'s more than you have allowed yourself to do in a single day. Please change the limit.',
        ACCTDORMANT: 'DORM',
        IDFC_LTD: 'IDFC LIMITED',
        NEFT_MSG: 'NEFT (National Electronic Funds Transfer) allows you to transfer money from your account to any other person\'s account. It is available from 8AM to 6:30PM  on weekdays and 8AM to 12:30PM on Saturdays. You can make transfers of any amount up to INR 10,00,000.',
        IMPS_MSG: 'IMPS (Immediate Payment Service) allows you to transfer money from your account to any other bank account. It is available 24x7, even on holidays. You can make transfers of any amount  between INR 1.00 to 2,00,000.',
        RTGS_MSG: 'RTGS (Real Time Gross Settlement) allows you to transfer money from your account to any other bank account. It is available from 9AM to 4:30PM on weekdays and 9AM to 1:30PM on Saturdays. You can make transfers of any amount between INR 2,00,000 and 10,00,000.',

        /* FUND Transfer - END */

        /* Limit management-Start */
        LIMIT_MAXAMOUNT: 2000000,
        LIMIT_MIN: -1,
        /* Limit management-End */
        /* Term Deposit - START */
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
        /* Term Deposit - END */

        /* Forgot Login Password -Start */
        FRGT_PWD_MAX_INVALID_ATEMPT_ERRMSG: 'Exceeded maximum attempts for password reset.',
        FRGT_PWD_MAX_INVALID_ATEMPT_COUNT: 5,
        FRGT_PWD_ERR_CODE_INVALID_USERNAME: 'CHP01',
        /* Forgot Login Password -End */

        /* Nav Footer -Start */

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

        /* Nav Footer -End */


        /* Loan Summary Start*/
        TECHNICAL_ERROR: 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
        TECHNICAL_ERROR_LOAN_DETAILS: 'Sorry, Our machines are not talking to each other! Please try in a while.',
        ERROR_NO_LOANS: 'You have no loans from us',
        /* Loan Summary End*/


        /* loan interst certificate */
        ERROR_FIN_MSG: 'You missed selecting Loan Financial Year',
        ERROR_ACC_MSG: 'Please select the Loan Account Number to view the Interest Certificate',
        ERROR_ACC_NOTDISB: 'Sorry, you have no interest certificate for the year selected. Please select a different year.',
        ERROR_SYS_MSG: 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
        ERROR_PDF: 'Sorry, unable to download the certificate. Please try again in some time.',
        ERROR_EMAIL: 'Sorry, we are unable to send your interest certificate. Please try again in some time',
        START_DATE: '01-Apr-',
        END_DATE: '31-Mar-',

        /* loan interst certificate */

        /* Loan Simulator */
        ERROR_FC_SIMULATION: 'We cannot simulate a part pre-payment or foreclosure on a partially disbursed loan. For foreclosure at this stage please contact our Contact Center on 1800-419-4332 or visit our nearest branch.',
        ERROR_PREPAY_SIMULATION: 'We cannot simulate a part pre-payment or foreclosure on a partially disbursed loan. For part pre-payment at this stage please contact our Contact Center on 1800-419-4332 or visit our nearest branch.',
        ERROR_DUE_AMOUNT: 'You cannot make a part payment lesser than your current due amount. To simulate a part pre-payment, please enter a value more than current due but less than your total outstanding.',



        /* BIB Changes Start */
        /* Added for Dashboard */
        FORTHCOMING_DUES_MESSAGE: 'No forthcoming dues.What a happy state to be in !',
        SERVICE_REQUEST_MESSAGE: 'No service requests pending',
		SERVICE_REQUEST_MESSAGE_DETAIL: 'Something went wrong with the request no:',
        WITHIN_BANK: 'Within Bank',
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
        TOA_MAINTAIN_NAME: 'Maintain',
        TOA_DELINK_NAME: 'Delink Accounts',
        TOA_LINK_NAME: 'Link Accounts',
        TOA_APPLY_NAME: 'Apply',
        TOA_MAINTAIN_VALUE: 'maintain',
        TOA_DELINK_VALUE: 'delink',
        TOA_LINK_VALUE: 'link',
        TOA_APPLY_VALUE: 'apply',
        TOA_NOT_ELIGIBLE: 'You are not eligible for Truly One Relationship',
        TOA_LINK_ERROR: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us. If you’d like to know more or apply for either please reach out to your RM.',
		TOA_APPLY_ERROR: 'You can link only one savings and current account to form a Truly One Account and you already have one. If you’d like to know more please feel free to reach out to your RM.',
		TOA_DISP_ACTIVE_N: 'N',
		TOA_DISP_ACTIVE_Y: 'Y',
		TOA_LAST_DATE: '2099-12-31',
		LINK_START_AMEND: '00',
		TOA_SWEEP_NAME: 'Sweeps',
		TOA_UDC_NAME: 'Unified Debit Card',
		TOA_UDC_VALUE: 'udc',
		//SWEEPS_VALIDATION_MESSAGE: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us.If you’d like to know more or apply for either please reach out to your RM.',
        TOA_UDC_ERROR: 'Your savings account debit card is in blocked status. Please unblock it online and then retry.',
        TOA_NO_CA_CARD: 'To apply for a unified debit card you need a business debit card linked to your current account. If you’d like to know more or apply for either please reach out to your RM.',
        TOA_MULTIPLE_CARDS:'We are unable to proceed with your request as you have multiple debit cards linked to your current account. If you’d like to know more please reach out to your RM.',
        TOA_REQUEST_FOR_LINK:'LINK',
        TOA_ACCNT_TYP_PARAM:'11',
        TOA_REQUEST_FOR_DELINK:'DELINK',
        TOA_REQUEST_FRM_UDC:'udc',
		TOA_APPLY_SUBMIT_ERROR:'Sorry, something went wrong, and the lead didn’t get generated. Please try again.',
		TOA_SYSTEM_ERROR:'Sorry, one of our systems is not responding. Please try again in some time',
		TOA_LINK_SUBMIT_ERROR:'Sorry, your accounts have not been linked. Please try again',
		//TOA_SWEEP_SUBMIT_ERROR:'Sweep Not Set Up. Something went wrong. Please try again later.',
		TOA_DELINK_SUBMIT_ERROR:'Something went wrong. Your accounts have not been delinked. Please try again.',
        //DELINK_VALIDATION_MESSAGE: 'Truly One Account  is only for sole proprietors and individuals who hold both a current and a savings account with us. If you'd like to know more or apply for either please reach out to your RM.',
		
		/* Truly One Account -End */

        /* Truly One Account -End */

        /* Sweeps start */
        FD_TENURE: 366,
        MINIMUM_SWEEPOUT_AMOUNT: 10000,
        THRESHOLD_AMOUNT: 100000,
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
        SWEEP_MANADATE_PRODUCT_TYPE1000: '1000',
        SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_10K: '3001',
        SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_1LAC: '3002',
        SWEEP_MANADATE_PRODUCT_TYPE_WORLD_BUSINESS: '3004',
        SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_BUSINESS: '3005',
        SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_PLUS: '3007',
        SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_TASC_CA_10K: '3201',
        SWEEP_MANADATE_PRODUCT_DYNAMIC_TASC_CA: '3202',
        SWEEP_MANADATE_PRODUCT_CA_GOVT: '4004',

        SWEEP_MANADATE_PRODUCT_TYPE2000: '2000',
        SWEEP_MANADATE_PRODUCT_TYPE_REGULAR_TASC_SA_10K: '3201',
        SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_TASC_SA: '3202',
        SWEEP_MANADATE_PRODUCT_TYPE_DYNAMIC_PLUS_TASC_SA: '3203',
        SWEEP_MANADATE_PRODUCT_SA_GOVT: '4004',
        SWEEP_MANADATE_PRODUCT_SA_KIDS: '1002',
        SWEEP_MANADATE_PRODUCT_SA_KIDS_SELF: '1003',
        SWEEP_MANADATE_PRODUCT_SA_SENIORCITIZEN: '1004',
		SWEEP_MANDATE_ACCOUNT_ACTIVE_STATUS : 'ACTIVE',
        /* Sweeps End */

		BIB_ERROR_SYS_MSG : 'Sorry, Our machines are not talking to each other! Humans are trying to fix the problem. Please try again in a while.',
        /* BIB Changes End */
		ECOM_ERROR_PAGE : '/checkout_failure',
        /* SSO Start */
        CHILD_SESSION_ALREADY_OPEN: 'Session already open',
        /* SSO End */

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
		
		/* WMS Start */
		
		TRAVEL_INS_SINGLETRIP_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/travel-insurance/know-more-about-the-product.html',
		TRAVEL_INS_MULTIROUNDTRIP_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/travel-insurance/know-more-about-the-product.html',
		TRAVEL_INS_SENIORCITIZENTRAVELINSURANCE_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/travel-insurance/know-more-about-the-product.html',
		TRAVEL_INS_FAQ:'http://www.idfcbank.com/personal-banking/insurance/travel-insurance/faqs.html',
		TRAVEL_INS_POLICYWORDING:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/travel-insurance/pdf/international_travel_insurance_brochure.pdf',
		TRAVEL_INS_CLAIMPROCESS:'https://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/travel-insurance/images/Travel-Claims-Process-Pro.pdf',
		TRAVEL_INS_DISCLAIMER:'https://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/travel-insurance/images/Travel-Insurance-Disclaimer.pdf',



		MOTOR_INS_CARINSURANCE_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/motor-insurance/car-insurance.html',
		MOTOR_INS_TWOWHEELER_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/motor-insurance/two-wheeler-insurance.html',
		MOTOR_INS_FAQ:'http://www.idfcbank.com/personal-banking/insurance/motor-insurance/faqs.html',
		MOTOR_INS_POLICYWORDING_CAR:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/motor-insurance/pdf/Car-Insurance-Brochure.pdf',
        MOTOR_INS_POLICYWORDING_BIKE:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/motor-insurance/pdf/2-Wheeler-Insurance.pdf',
        MOTOR_INS_CLAIM_PROCESS:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/motor-insurance/pdf/Motor-Claim-Process-pro.pdf',
        MOTOR_INS_LISTOFGARAGES:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/motor-insurance/pdf/Cashless-Garage-Pvt-Car-TW-tie-up-garage-list-150916.xls',
        MOTOR_INS_DISCLAIMER_TWO:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/motor-insurance/pdf/Motor-Insurance-Disclaimer.pdf',
        //MOTOR_INS_DISCLAIMER_CAR:'http://www.idfcbank.com/content/dam/idfc/image/other-pdfs/motor-insurance/Disclaimer-Pivate-Car-Insurance.pdf',
	

		HEALTH_INS_CALCULATE:'http://www.idfcbank.com/personal-banking/common-apply-now.html?p=gi',
		HEALTH_INS_FAQ:'http://www.idfcbank.com/personal-banking/insurance/health-insurance/faqs.html',
       	//HEALTH_INS_FAQ_BOSTER:'http://www.idfcbank.com/personal-banking/insurance/health-insurance/faqs.html',
        HEALTH_INS_POLICYWORDING:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/complete-health-insurance-brochure.pdf',
        HEALTH_INS_POLICYWORDING_BOSTER:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/health-booster-brochure.pdf',
		HEALTH_INS_CLAIMPROCESS_CARE:'https://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/Health-Claim-Process-pro.pdf',
		//HEALTH_INS_CLAIMPROCESS_FORM:'http://adobuatweb.idfcbank.com/content/dam/idfc/image/other-pdfs/download-pre-authorisation-form.pdf',
        HEALTH_INS_LISTOFNETWORK_HOSPITALS:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/Cashless-Network-Hospital-List-16-Mar-2016.xls',
		HEALTH_INS_KNOWMOREFORBUYHEALTHINSURANCE:'http://www.idfcbank.com/personal-banking/insurance/health-insurance/basic-health-insurance.html',
		HEALTH_INS_KNOWMOREFORHEALTHBOOSTER:'http://www.idfcbank.com/personal-banking/insurance/health-insurance/enhance-your-existing-cover.html',
   		WMS_HEALTH_Disclaimer_Buy:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/Health-Insurance-Disclaimer.pdf',
   		//WMS_HEALTH_Disclaimer_Booster:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/health-insurance/pdf/Health-Insurance-Disclaimer.pdf',



		life_ins_Calculate:'http://www.idfcbank.com/personal-banking/common-apply-now.html?p=li',
		life_ins_Knowmore:'http://www.idfcbank.com/personal-banking/insurance/term-insurance/know-more-about-product.html',
		life_ins_FAQ:'http://www.idfcbank.com/personal-banking/insurance/term-insurance/faqs.html',
		life_ins_Policywording:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/term-insurance/pdf/HDFC-Click2protect-Plus-brochure.pdf',
		life_ins_Claimprocess:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/term-insurance/pdf/Term-Claim-Process-pro.pdf',
		life_ins_Disclaimer:'https://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/term-insurance/pdf/C2P-Disclaimer.pdf',


		ULIP_INS_FUNDOPTIONS:'http://www.idfcbank.com/personal-banking/insurance/click-to-invest/know-more-about-the-product.html',
		ULIP_INS_KNOWMORE:'http://www.idfcbank.com/personal-banking/insurance/click-to-invest/know-more-about-the-product.html',
		ULIP_INS_FAQ:'http://www.idfcbank.com/personal-banking/insurance/click-to-invest/faqs.html',
        ULIP_INS_POLICYWORDING:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/click-to-invest/pdf/HDFC-Life-Click-2-Invest-Brochure.pdf',
        ULIP_INS_CLAIMPROCESS_CARE:'http://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/click-to-invest/pdf/ULIP-Claim-Process-pro.pdf',
		ULIP_INS_DISCALIMER:'https://www.idfcbank.com/content/dam/idfc/image/personal-banking/personal-insurance/click-to-invest/pdf/Click-to-invest-Disclaimer.pdf',
		//ULIP_INS_CLAIMPROCESS_FORM:'http://adobuatweb.idfcbank.com/content/dam/idfc/image/other-pdfs/download-pre-authorisation-form.pdf',
		//WMS_HEALTH_INSURANCE_FAQ_URL:'http://www.idfc.com/',		
		ICICI_ERROR:'Oops! Something went wrong.',

		ULIP_PRODUCT_CODE:'SINVT',
        LIFE_TERM_PRODUCT_CODE:'PROT',
        HEALTH_BUY_PRODUCT_CODE:'4128',
        HEALTH_BOOSTER_PRODUCT_CODE:'4140',
        MOTOR_CAR_PRODUCT_CODE:'3001',
        MOTOR_BIKE_PRODUCT_CODE:'3005',
        TRAVEL_SENIOR_PRODUCT_CODE:'4129',
        TRAVEL_SINGLE_PRODUCT_CODE:'4129_S',
        TRAVEL_MULTIPLE_PRODUCT_CODE:'4129_M',

		/*WMS GOLD */
		GOLD_POOL_ACCOUNT:'98024102010',
		ACCOUNT_MOO_AS: 'ANY OR SURVIVOR',
		ACCOUNT_MOO_ES: 'EITHER OR SURVIVOR', 
		ACCOUNT_MOO_LG: 'LEGAL GUARDIAN',
		ACCOUNT_MOO_MH: 'MANDATE HOLDER',
		ACCOUNT_MOO_SI: 'SINGLY',
		GOLD_TRANS_TIME: 'Gold bond purchase window has passed.',
		ACCOUNT_ODONE_TYPE:'4101',
		ACCOUNT_ODTWO_TYPE:'4121',
		ACCOUNT_ODTHREE_TYPE:'4122',
		ACCOUNT_ODFOUR_TYPE:'4124',
		ACCOUNT_ODFIVE_TYPE:'4123',
		ACCOUNT_ODSIX_TYPE:'4141',
		ACCOUNT_ODSEVEN_TYPE:'4501',
		ACCOUNT_ODEIGHT_TYPE:'4521',
		ACCOUNT_ODNINE_TYPE:'4541',
		ACCOUNT_ODTEN_TYPE:'4561',
		ACCOUNT_ODONE_SUBTYPE:'4000',
		ACCOUNT_ODTWO_SUBTYPE:'4500',
		RIB_BIB_URL: {
             "bibuser":"onex/individual",
                       "bibaus":"onex",
                       "user":"netbanking",
                       "bibadmin":"bibadmin/home",
                       "merchantpwdreset": "bibadmin/home",
                       "BBADMIN-CHANGE-PASSWORD": "bibadmin/home",
                       "merchant": "bibadmin/home",
                       "bibsuperadmin": "bibadmin/home",
                       "bocuser": "bibadmin/home",
					   "uammaker": "bibadmin/home",
						"uamchecker": "bibadmin/home",
						"pdgmaker": "bibadmin/home",
					   "pdgchecker": "bibadmin/home",
					   "opsmaker": "bibadmin/home",
					   "opschecker": "bibadmin/home"
        }

		
		/* WMS END */
		
		
    };

});
