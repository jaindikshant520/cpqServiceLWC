/*
  @description       : 
  @author            : ChangeMeIn@UserSettingsUnder.SFDoc
  Ver   Date         Author                                            Modification
 1.1  01/17/2022   Dikshant Jain      GTMSER-8307: (Channel Partner) Education Case: Lightning Enhancements for Education Training Case Escalation, Case Closing, and Managing Case Team for Channel Partners      
*/
import { api, LightningElement,track,wire } from 'lwc';
import ESCALATION_REASON_FIELD from '@salesforce/schema/Case.Escalation_Reason__c';
import {getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord } from "lightning/uiRecordApi";
import CASE_OBJECT from '@salesforce/schema/Case';
import { NavigationMixin } from 'lightning/navigation';
import addCaseComment from '@salesforce/apex/LWCEscalateCaseClass.addCaseComment';
import fetchEscalationStatus from '@salesforce/apex/LWCEscalateCaseClass.fetchEscalationStatus';
import CASE_RECORDTYPE_FIELD from '@salesforce/schema/Case.RecordTypeId';

export default class LWCEscalateCase extends NavigationMixin(LightningElement) {
/*     get optionsRadio() {
        return [
            { label: '', value: '' },
        ];
    } */
    @track showSpinner = false;
    options = [];
    countryOptions = [];
    picklistOptions = [];
    selectedValue;
    @track ECaseStatus = false;
    @track showClosedMessage = false;
    @api recordId;
    @track Countrycode;
    @track case;
    @track reasonValue;
    @track RequestACallCheckbox = false;
    @track testAreaValue;
    @track phone='';
    @track mobile='';
    @track other='';
    @track escStatus;
    @track CaseNumber;
    @track errorShowOnUI;
    @track showRadioDivdisabled;
    @track showRadioDiv;
    isCssLoaded= false;
    caseRecordTypeId='';
    escalationStatus;
    eStatus;
    @track selectedPhoneValue;
    @track selectedMobileValue;
    @track selectedOtherPhoneValue;
    @track phoneValue;
    @track mobileValue;
    @track otherPhoneValue;
    @track escReason;
    @track phoneCode;
    @track mobileCode;
    @track otherPhoneCode;
    @track radioValue;
    @track caseCmtNumber;
    connectedCallback(){
        this.showSpinner = true;
        this.showRadioDiv =false;
        this.eStatus = false;
        this.countryListAllIsoData.forEach(element =>{
            this.countryOptions.push({label: element.name +'-'+element.code3 +' ('+element.countryCode +') ', value:element.number +' ('+element.countryCode+') '});
        })
        fetchEscalationStatus({
            caseId:this.recordId
        }).then(result => {
                this.escStatus = JSON.parse(result);
                this.CaseNumber = this.escStatus.CaseNumber;
                this.escalationStatus = this.escStatus.escalationStatus;
                this.caseRecordTypeId = this.escStatus.recordTypeId;
                this.phoneValue = this.escStatus.phone;
                this.mobileValue = this.escStatus.mobile;
                this.otherPhoneValue = this.escStatus.otherPhone;
                this.escReason = this.escStatus.escalationReason;
                for(let key in this.countryListAllIsoData){
                    if(this.phoneValue && this.phoneValue.startsWith(this.countryListAllIsoData[key].countryCode)){
                        this.selectedPhoneValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.phoneCode = this.countryListAllIsoData[key].countryCode;
                        this.phoneValue = this.phoneValue.replace(this.phoneCode,'');
                        break;
                    }else if((!this.phoneValue || !this.phoneValue.startsWith(this.countryListAllIsoData[key].countryCode)) && this.countryListAllIsoData[key].code3 == 'USA'){
                        this.selectedPhoneValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.phoneCode = this.countryListAllIsoData[key].countryCode;
                        break;
                    }
                }
                for(let key in this.countryListAllIsoData){
                    if(this.mobileValue && this.mobileValue.startsWith(this.countryListAllIsoData[key].countryCode)){
                        this.selectedMobileValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.mobileCode = this.countryListAllIsoData[key].countryCode;
                        this.mobileValue = this.mobileValue.replace(this.mobileCode,'');
                        break;
                    }else if((!this.mobileValue || !this.mobileValue.startsWith(this.countryListAllIsoData[key].countryCode)) && this.countryListAllIsoData[key].code3 == 'USA'){
                        this.selectedMobileValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.mobileCode = this.countryListAllIsoData[key].countryCode;
                        break;
                    }
                }
                for(let key in this.countryListAllIsoData){
                    if(this.otherPhoneValue && this.otherPhoneValue.startsWith(this.countryListAllIsoData[key].countryCode)){
                        this.selectedOtherPhoneValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.otherPhoneCode = this.countryListAllIsoData[key].countryCode;
                        this.otherPhoneValue = this.otherPhoneValue.replace(this.otherPhoneCode,'');
                        break;
                    }else if((!this.otherPhoneValue || !this.otherPhoneValue.startsWith(this.countryListAllIsoData[key].countryCode)) && this.countryListAllIsoData[key].code3 == 'USA'){
                        this.selectedOtherPhoneValue = this.countryListAllIsoData[key].number + ' ('+this.countryListAllIsoData[key].countryCode+') ';
                        this.otherPhoneCode = this.countryListAllIsoData[key].countryCode;
                        break;
                    }
                }
                if(this.escStatus.Status == 'Closed'){
                    this.ECaseStatus = false;
                    this.showClosedMessage = true;
                }else{
                    this.ECaseStatus = true;
                    this.showClosedMessage = false;
                }
                if(this.escalationStatus == null || this.escalationStatus == 'Resolved'){
                    this.eStatus = true;
                }else{
                    this.eStatus = false;
                }
                this.showSpinner = false;
            })
            .catch(error => {
                this.error = error;
                this.showClosedMessage = false;
                this.ECaseStatus = true;
                this.showSpinner = false;
                this.eStatus = false;
            });
    }
    @track countryCodeAppend;
    @track matched;
    handleCountryChange(event){
        this.matched = event.target.value;
        this.countryCodeAppend = this.matched.substring(this.matched.indexOf('(')+1,this.matched.lastIndexOf(')') );
    }
    phoneNumberHandler(event){
        this.phone = this.countryCodeAppend + event.target.value;
    }
    mobileNumberHandler(event){
        this.mobile = this.countryCodeAppend + event.target.value;
    }
    @track mNumber='';
    otherNumberHandler(event){
        this.mNumber = event.target.value;
        this.otherPhoneValue = event.target.value;
        console.log('---153 --'+this.otherPhoneValue);
    }
    checktestarea(event){
        this.testAreaValue = event.target.value;
    }

    @wire( getObjectInfo, { objectApiName: CASE_OBJECT } )
    objectInfo;

    ERrecordTypeId='';
    @wire(getRecord, { recordId:'$recordId', fields: CASE_RECORDTYPE_FIELD })
    getCase({ error, data }){
    if(data){
        var result = JSON.parse(JSON.stringify(data));
        this.case = result;
        this.ERrecordTypeId = result.fields.RecordTypeId.value;
        }else if(error) {
            var result = JSON.parse(JSON.stringify(error));
        }
    };
   @wire( getPicklistValues, { recordTypeId: '$ERrecordTypeId', fieldApiName: ESCALATION_REASON_FIELD } )
    wiredData( { error, data } ) {
        if ( data ) {
            this.options = data.values.map( objPL => {
                return {
                    label: `${objPL.label}`,
                    value: `${objPL.value}`
                };
            });
        } else if ( error ) {
            console.error( JSON.stringify( error ) );
        }
    }

    handlePicklistChange( event ) {
        this.reasonValue = event.detail.value;
    }

    checkboxchange(event){
        this.RequestACallCheckbox = event.target.checked;
        if(this.RequestACallCheckbox){
            this.showRadioDiv = true;
        }else{
            this.showRadioDiv=false;
            this.template.querySelectorAll('lightning-input[data-id="conNo123"]').forEach(element => {
                element.value = null;
            });
        }
    }
    radioButtonClicked(event){
        this.radioValue = event.target.value;
    }
    OnSave(event){
        console.log('----'+this.radioValue);
        console.log('--this.mNumber--'+this.mNumber);
        console.log('--this.countryCodeAppend--'+this.countryCodeAppend);
        console.log('--otherPhoneValue--'+this.otherPhoneValue);
        console.log('-phoneValue---'+this.phoneValue);
        console.log('-phonemobileValueValue---'+this.mobileValue);
        if(this.testAreaValue == '' || this.testAreaValue == null || (this.eStatus == true && (this.reasonValue == '' || this.reasonValue == null))){
            this.errorShowOnUI = 'Please fill Required Information.';
        }else if(this.RequestACallCheckbox && !this.radioValue){
            this.errorShowOnUI = 'Please select any number for communication.';
        }else if(this.RequestACallCheckbox && this.radioValue == 'radio-45' && (this.mNumber && (this.mNumber.startsWith('+') || this.mNumber.match(/^[0-9]+$/) == null))){
            this.errorShowOnUI = 'Phone number start with an Integer Value. Or Do not append Country Code or enter a correct number.';
        }else if(this.RequestACallCheckbox && this.radioValue == 'radio-45' && (this.mNumber && (this.mNumber.length<8 || this.mNumber.length >15))){
            this.errorShowOnUI = 'Please enter a correct number.';
        }/* else if(this.RequestACallCheckbox && this.radioValue == 'radio-45' && this.mNumber && !this.countryCodeAppend && this.otherPhoneCode){
            this.errorShowOnUI = 'Please add country code.';
        } */else if(this.RequestACallCheckbox && this.radioValue == 'radio-45' && !this.mNumber && !this.otherPhoneValue){
            this.errorShowOnUI = 'Please add phone number.';
        }else if(this.RequestACallCheckbox && this.radioValue == 'radio-45' && !this.mNumber && !this.phoneValue && !this.mobileValue && !this.otherPhoneValue){
            this.errorShowOnUI = 'Please add other phone number.';
        }else{
            if((this.phoneValue || this.mobileValue) && !this.otherPhoneValue && this.RequestACallCheckbox){
                this.casecalling();
                console.log('220 -- ');
            }else{
                this.casecalling();
                console.log('223 -- ');
            }
        }
    }

    OnCancel(){
        window.history.back();
    }

    res;
    temp;
    temp1;
    casecalling(){
        this.showSpinner = true;
        if(this.radioValue == 'radio-43'){
            if(!this.countryCodeAppend && (this.phoneValue || !this.phoneValue)){
                this.caseCmtNumber = this.phoneCode + this.phoneValue;
            }else if(this.countryCodeAppend && (this.phoneValue || !this.phoneValue)){
                this.caseCmtNumber = this.countryCodeAppend + this.phoneValue;
            }
        }else if(this.radioValue == 'radio-44'){
            if(!this.countryCodeAppend && (this.mobileValue || !this.mobileValue)){
                this.caseCmtNumber = this.mobileCode + this.mobileValue;
            }else if(this.countryCodeAppend && (this.mobileValue || !this.mobileValue)){
                this.caseCmtNumber = this.countryCodeAppend + this.mobileValue;
            }
        }
        else if(this.radioValue == 'radio-45'){
            if(!this.countryCodeAppend && (this.otherPhoneValue || !this.otherPhoneValue)){
                this.caseCmtNumber = this.otherPhoneCode + this.otherPhoneValue;
            }else if(this.countryCodeAppend && (this.otherPhoneValue || !this.otherPhoneValue)){
                this.caseCmtNumber = this.countryCodeAppend + this.otherPhoneValue;
            }
        }
        if(this.caseCmtNumber && this.caseCmtNumber.includes('null')){
            this.caseCmtNumber = this.caseCmtNumber.replace('null','');
        }
       /*  if(!this.countryCodeAppend && this.otherPhoneValue){
            this.otherPhoneValue = this.otherPhoneCode + this.otherPhoneValue;
        }else if(this.countryCodeAppend && this.otherPhoneValue){
            this.otherPhoneValue = this.countryCodeAppend + this.otherPhoneValue;
        } */
        if(this.escReason != '' && this.escReason != null){
            this.reasonValue = this.escReason;
        }
        console.log('--238----'+this.otherPhoneValue);
        console.log('--238----'+this.mobile);
        console.log('--238----'+this.phone);
        let jsonLWCEscalate = {escalationReason:this.reasonValue,
            escalationJustification:this.testAreaValue,
            requestCall:this.RequestACallCheckbox,
            phone:this.phone,
            mobile:this.mobile,
            other:this.caseCmtNumber,
            caseId:this.recordId};
        addCaseComment({
            jsonLWCEscalate:JSON.stringify(jsonLWCEscalate)}
        ).then(result => {
            /* this.res = result;
            if(this.res == 'Closed'){
                this.showSpinner = false;
            }else{
                this.showSpinner = false;
            } */
            this.showSpinner = false;
            window.open('/channelpartnercenter/s/case/'+this.recordId,'_parent');
        }
        ).catch(error=> {
            this.showSpinner = false;
            this.temp = JSON.stringify(error);
            this.temp1 = JSON.parse(this.temp);
            this.errorShowOnUI = this.temp1.body.message;
        });
    }

    caseData({ error, data }) {
        if (data) {
            this.error = undefined;

        } else if (error) {
            this.error = error;
        }
    }
    countryListAllIsoData = [
        {"code": "AF", "code3": "AFG", "name": "Afghanistan", "number": "004" ,"countryCode":"+93"},
        {"code": "AL", "code3": "ALB", "name": "Albania", "number": "008","countryCode":"+355"},
        {"code": "DZ", "code3": "DZA", "name": "Algeria", "number": "012","countryCode":"+213"},
        {"code": "AS", "code3": "ASM", "name": "American Samoa", "number": "1684","countryCode":"+1684"},
        {"code": "AD", "code3": "AND", "name": "Andorra", "number": "020","countryCode":"+376"},
        {"code": "AO", "code3": "AGO", "name": "Angola", "number": "024","countryCode":"+244"},
        {"code": "AI", "code3": "AIA", "name": "Anguilla", "number": "660","countryCode":"+1264"},
        {"code": "AQ", "code3": "ATA", "name": "Antarctica", "number": "010","countryCode":"+672"},
        {"code": "AG", "code3": "ATG", "name": "Antigua and Barbuda", "number": "028","countryCode":"+1268"},
        {"code": "AR", "code3": "ARG", "name": "Argentina", "number": "032","countryCode":"+54"},
        {"code": "AM", "code3": "ARM", "name": "Armenia", "number": "051","countryCode":"+374"},
        {"code": "AW", "code3": "ABW", "name": "Aruba", "number": "533","countryCode":"+297"},
        {"code": "AU", "code3": "AUS", "name": "Australia", "number": "036","countryCode":"+61"},
        {"code": "AT", "code3": "AUT", "name": "Austria", "number": "040","countryCode":"+43"},
        {"code": "AZ", "code3": "AZE", "name": "Azerbaijan", "number": "031","countryCode":"+994"},
        {"code": "BS", "code3": "BHS", "name": "Bahamas (the)", "number": "044","countryCode":"+1242"},
        {"code": "BH", "code3": "BHR", "name": "Bahrain", "number": "048","countryCode":"+973"},
        {"code": "BD", "code3": "BGD", "name": "Bangladesh", "number": "050","countryCode":"+880"},
        {"code": "BB", "code3": "BRB", "name": "Barbados", "number": "052","countryCode":"+1246"},
        {"code": "BY", "code3": "BLR", "name": "Belarus", "number": "112","countryCode":"+375"},
        {"code": "BE", "code3": "BEL", "name": "Belgium", "number": "056","countryCode":"+32"},
        {"code": "BZ", "code3": "BLZ", "name": "Belize", "number": "084","countryCode":"+501"},
        {"code": "BJ", "code3": "BEN", "name": "Benin", "number": "204","countryCode":"+229"},
        {"code": "BM", "code3": "BMU", "name": "Bermuda", "number": "060","countryCode":"+1441"},
        {"code": "BT", "code3": "BTN", "name": "Bhutan", "number": "064","countryCode":"+975"},
        {"code": "BO", "code3": "BOL", "name": "Bolivia (Plurinational State of)", "number": "068","countryCode":"+591"},
        {"code": "BQ", "code3": "BES", "name": "Bonaire, Sint Eustatius and Saba", "number": "535","countryCode":"+599"},
        {"code": "BA", "code3": "BIH", "name": "Bosnia and Herzegovina", "number": "070","countryCode":"+387"},
        {"code": "BW", "code3": "BWA", "name": "Botswana", "number": "072","countryCode":"+267"},
        {"code": "BV", "code3": "BVT", "name": "Bouvet Island", "number": "074","countryCode":"+55"},
        {"code": "BR", "code3": "BRA", "name": "Brazil", "number": "076","countryCode":"+55"},
        {"code": "IO", "code3": "IOT", "name": "British Indian Ocean Territory (the)", "number": "086","countryCode":"+246"},
        {"code": "BN", "code3": "BRN", "name": "Brunei Darussalam", "number": "096","countryCode":"+673"},
        {"code": "BG", "code3": "BGR", "name": "Bulgaria", "number": "100","countryCode":"+359"},
        {"code": "BF", "code3": "BFA", "name": "Burkina Faso", "number": "854","countryCode":"+226"},
        {"code": "BI", "code3": "BDI", "name": "Burundi", "number": "108","countryCode":"+257"},
        {"code": "CV", "code3": "CPV", "name": "Cabo Verde", "number": "132","countryCode":"+238"},
        {"code": "KH", "code3": "KHM", "name": "Cambodia", "number": "116","countryCode":"+855"},
        {"code": "CM", "code3": "CMR", "name": "Cameroon", "number": "120","countryCode":"+237"},
        {"code": "CA", "code3": "CAN", "name": "Canada", "number": "124","countryCode":"+1"},
        {"code": "KY", "code3": "CYM", "name": "Cayman Islands (the)", "number": "136","countryCode":"+1345"},
        {"code": "CF", "code3": "CAF", "name": "Central African Republic (the)", "number": "140","countryCode":"+236"},
        {"code": "TD", "code3": "TCD", "name": "Chad", "number": "148","countryCode":"+235"},
        {"code": "CL", "code3": "CHL", "name": "Chile", "number": "152","countryCode":"+56"},
        {"code": "CN", "code3": "CHN", "name": "China", "number": "156","countryCode":"+86"},
        {"code": "CX", "code3": "CXR", "name": "Christmas Island", "number": "162","countryCode":"+61"},
        {"code": "CC", "code3": "CCK", "name": "Cocos (Keeling) Islands (the)", "number": "166","countryCode":"+61"},
        {"code": "CO", "code3": "COL", "name": "Colombia", "number": "170","countryCode":"+57"},
        {"code": "KM", "code3": "COM", "name": "Comoros (the)", "number": "174","countryCode":"+269"},
        {"code": "CD", "code3": "COD", "name": "Congo (the Democratic Republic of the)", "number": "180","countryCode":"+243"},
        {"code": "CG", "code3": "COG", "name": "Congo (the)", "number": "178","countryCode":"+243"},
        {"code": "CK", "code3": "COK", "name": "Cook Islands (the)", "number": "184","countryCode":"+682"},
        {"code": "CR", "code3": "CRI", "name": "Costa Rica", "number": "188","countryCode":"+506"},
        {"code": "HR", "code3": "HRV", "name": "Croatia", "number": "191","countryCode":"+385"},
        {"code": "CU", "code3": "CUB", "name": "Cuba", "number": "192","countryCode":"+53"},
        {"code": "CW", "code3": "CUW", "name": "Curaçao", "number": "531","countryCode":"+599"},
        {"code": "CY", "code3": "CYP", "name": "Cyprus", "number": "196","countryCode":"+357"},
        {"code": "CZ", "code3": "CZE", "name": "Czechia", "number": "203","countryCode":"+420"},
        {"code": "CI", "code3": "CIV", "name": "Côte d'Ivoire", "number": "384","countryCode":"+225"},
        {"code": "DK", "code3": "DNK", "name": "Denmark", "number": "208","countryCode":"+45"},
        {"code": "DJ", "code3": "DJI", "name": "Djibouti", "number": "262","countryCode":"+253"},
        {"code": "DM", "code3": "DMA", "name": "Dominica", "number": "212","countryCode":"+1767"},
        {"code": "DO", "code3": "DOM", "name": "Dominican Republic (the)", "number": "214","countryCode":"+1"},
        {"code": "EC", "code3": "ECU", "name": "Ecuador", "number": "218","countryCode":"+593"},
        {"code": "EG", "code3": "EGY", "name": "Egypt", "number": "818","countryCode":"+20"},
        {"code": "SV", "code3": "SLV", "name": "El Salvador", "number": "222","countryCode":"+503"},
        {"code": "GQ", "code3": "GNQ", "name": "Equatorial Guinea", "number": "226","countryCode":"+240"},
        {"code": "ER", "code3": "ERI", "name": "Eritrea", "number": "232","countryCode":"+291"},
        {"code": "EE", "code3": "EST", "name": "Estonia", "number": "233","countryCode":"+372"},
        {"code": "SZ", "code3": "SWZ", "name": "Eswatini", "number": "748","countryCode":"+268"},
        {"code": "ET", "code3": "ETH", "name": "Ethiopia", "number": "231","countryCode":"+251"},
        {"code": "FK", "code3": "FLK", "name": "Falkland Islands (the) [Malvinas]", "number": "238","countryCode":"+500"},
        {"code": "FO", "code3": "FRO", "name": "Faroe Islands (the)", "number": "234","countryCode":"+298"},
        {"code": "FJ", "code3": "FJI", "name": "Fiji", "number": "242","countryCode":"+679"},
        {"code": "FI", "code3": "FIN", "name": "Finland", "number": "246","countryCode":"+358"},
        {"code": "FR", "code3": "FRA", "name": "France", "number": "250","countryCode":"+33"},
        {"code": "GF", "code3": "GUF", "name": "French Guiana", "number": "254","countryCode":"+594"},
        {"code": "PF", "code3": "PYF", "name": "French Polynesia", "number": "258","countryCode":"+689"},
        {"code": "TF", "code3": "ATF", "name": "French Southern Territories (the)", "number": "260","countryCode":"+262"},
        {"code": "GA", "code3": "GAB", "name": "Gabon", "number": "266","countryCode":"+241"},
        {"code": "GM", "code3": "GMB", "name": "Gambia (the)", "number": "270","countryCode":"+220"},
        {"code": "GE", "code3": "GEO", "name": "Georgia", "number": "268","countryCode":"+995"},
        {"code": "DE", "code3": "DEU", "name": "Germany", "number": "276","countryCode":"+49"},
        {"code": "GH", "code3": "GHA", "name": "Ghana", "number": "288","countryCode":"+233"},
        {"code": "GI", "code3": "GIB", "name": "Gibraltar", "number": "292","countryCode":"+350"},
        {"code": "GR", "code3": "GRC", "name": "Greece", "number": "300","countryCode":"+30"},
        {"code": "GL", "code3": "GRL", "name": "Greenland", "number": "304","countryCode":"+299"},
        {"code": "GD", "code3": "GRD", "name": "Grenada", "number": "308","countryCode":"+1473"},
        {"code": "GP", "code3": "GLP", "name": "Guadeloupe", "number": "312","countryCode":"+590"},
        {"code": "GU", "code3": "GUM", "name": "Guam", "number": "316","countryCode":"+1671"},
        {"code": "GT", "code3": "GTM", "name": "Guatemala", "number": "320","countryCode":"+502"},
        {"code": "GG", "code3": "GGY", "name": "Guernsey", "number": "831","countryCode":"+441481"},
        {"code": "GN", "code3": "GIN", "name": "Guinea", "number": "324","countryCode":"+224"},
        {"code": "GW", "code3": "GNB", "name": "Guinea-Bissau", "number": "624","countryCode":"+245"},
        {"code": "GY", "code3": "GUY", "name": "Guyana", "number": "328","countryCode":"+592"},
        {"code": "HT", "code3": "HTI", "name": "Haiti", "number": "332","countryCode":"+509"},
        {"code": "HM", "code3": "HMD", "name": "Heard Island and McDonald Islands", "number": "334","countryCode":"+672"},
        {"code": "VA", "code3": "VAT", "name": "Holy See (the)", "number": "336","countryCode":"+379"},
        {"code": "HN", "code3": "HND", "name": "Honduras", "number": "340","countryCode":"+504"},
        {"code": "HK", "code3": "HKG", "name": "Hong Kong", "number": "344","countryCode":"+852"},
        {"code": "HU", "code3": "HUN", "name": "Hungary", "number": "348","countryCode":"+36"},
        {"code": "IS", "code3": "ISL", "name": "Iceland", "number": "352","countryCode":"+354"},
        {"code": "IN", "code3": "IND", "name": "India", "number": "356","countryCode":"+91"},
        {"code": "ID", "code3": "IDN", "name": "Indonesia", "number": "360","countryCode":"+62"},
        {"code": "IR", "code3": "IRN", "name": "Iran (Islamic Republic of)", "number": "364","countryCode":"+98"},
        {"code": "IQ", "code3": "IRQ", "name": "Iraq", "number": "368","countryCode":"+964"},
        {"code": "IE", "code3": "IRL", "name": "Ireland", "number": "372","countryCode":"+353"},
        {"code": "IM", "code3": "IMN", "name": "Isle of Man", "number": "833","countryCode":"+441624"},
        {"code": "IL", "code3": "ISR", "name": "Israel", "number": "376","countryCode":"+972"},
        {"code": "IT", "code3": "ITA", "name": "Italy", "number": "380","countryCode":"+39"},
        {"code": "JM", "code3": "JAM", "name": "Jamaica", "number": "388","countryCode":"+1876"},
        {"code": "JP", "code3": "JPN", "name": "Japan", "number": "392","countryCode":"+81"},
        {"code": "JE", "code3": "JEY", "name": "Jersey", "number": "832","countryCode":"+441534"},
        {"code": "JO", "code3": "JOR", "name": "Jordan", "number": "400","countryCode":"+962"},
        {"code": "KZ", "code3": "KAZ", "name": "Kazakhstan", "number": "398","countryCode":"+7"},
        {"code": "KE", "code3": "KEN", "name": "Kenya", "number": "404","countryCode":"+254"},
        {"code": "KI", "code3": "KIR", "name": "Kiribati", "number": "296","countryCode":"+686"},
        {"code": "KP", "code3": "PRK", "name": "Korea (the Democratic People's Republic of)", "number": "408","countryCode":"+850"},
        {"code": "KR", "code3": "KOR", "name": "Korea (the Republic of)", "number": "410","countryCode":"+82"},
        {"code": "KW", "code3": "KWT", "name": "Kuwait", "number": "414","countryCode":"+965"},
        {"code": "KG", "code3": "KGZ", "name": "Kyrgyzstan", "number": "417","countryCode":"+996"},
        {"code": "LA", "code3": "LAO", "name": "Lao People's Democratic Republic (the)", "number": "418","countryCode":"+856"},
        {"code": "LV", "code3": "LVA", "name": "Latvia", "number": "428","countryCode":"+371"},
        {"code": "LB", "code3": "LBN", "name": "Lebanon", "number": "422","countryCode":"+961"},
        {"code": "LS", "code3": "LSO", "name": "Lesotho", "number": "426","countryCode":"+266"},
        {"code": "LR", "code3": "LBR", "name": "Liberia", "number": "430","countryCode":"+231"},
        {"code": "LY", "code3": "LBY", "name": "Libya", "number": "434","countryCode":"+218"},
        {"code": "LI", "code3": "LIE", "name": "Liechtenstein", "number": "438","countryCode":"+423"},
        {"code": "LT", "code3": "LTU", "name": "Lithuania", "number": "440","countryCode":"+370"},
        {"code": "LU", "code3": "LUX", "name": "Luxembourg", "number": "442","countryCode":"+352"},
        {"code": "MO", "code3": "MAC", "name": "Macao", "number": "446","countryCode":"+853"},
        {"code": "MG", "code3": "MDG", "name": "Madagascar", "number": "450","countryCode":"+261"},
        {"code": "MW", "code3": "MWI", "name": "Malawi", "number": "454","countryCode":"+265"},
        {"code": "MY", "code3": "MYS", "name": "Malaysia", "number": "458","countryCode":"+60"},
        {"code": "MV", "code3": "MDV", "name": "Maldives", "number": "462","countryCode":"+960"},
        {"code": "ML", "code3": "MLI", "name": "Mali", "number": "466","countryCode":"+223"},
        {"code": "MT", "code3": "MLT", "name": "Malta", "number": "470","countryCode":"+356"},
        {"code": "MH", "code3": "MHL", "name": "Marshall Islands (the)", "number": "584","countryCode":"+692"},
        {"code": "MQ", "code3": "MTQ", "name": "Martinique", "number": "474","countryCode":"+596"},
        {"code": "MR", "code3": "MRT", "name": "Mauritania", "number": "478","countryCode":"+222"},
        {"code": "MU", "code3": "MUS", "name": "Mauritius", "number": "480","countryCode":"+230"},
        {"code": "YT", "code3": "MYT", "name": "Mayotte", "number": "175","countryCode":"+262"},
        {"code": "MX", "code3": "MEX", "name": "Mexico", "number": "484","countryCode":"+52"},
        {"code": "FM", "code3": "FSM", "name": "Micronesia (Federated States of)", "number": "583","countryCode":"+691"},
        {"code": "MD", "code3": "MDA", "name": "Moldova (the Republic of)", "number": "498","countryCode":"+373"},
        {"code": "MC", "code3": "MCO", "name": "Monaco", "number": "492","countryCode":"+377"},
        {"code": "MN", "code3": "MNG", "name": "Mongolia", "number": "496","countryCode":"+976"},
        {"code": "ME", "code3": "MNE", "name": "Montenegro", "number": "499","countryCode":"+382"},
        {"code": "MS", "code3": "MSR", "name": "Montserrat", "number": "500","countryCode":"+1664"},
        {"code": "MA", "code3": "MAR", "name": "Morocco", "number": "504","countryCode":"+212"},
        {"code": "MZ", "code3": "MOZ", "name": "Mozambique", "number": "508","countryCode":"+258"},
        {"code": "MM", "code3": "MMR", "name": "Myanmar", "number": "104","countryCode":"+95"},
        {"code": "NA", "code3": "NAM", "name": "Namibia", "number": "516","countryCode":"+264"},
        {"code": "NR", "code3": "NRU", "name": "Nauru", "number": "520","countryCode":"+674"},
        {"code": "NP", "code3": "NPL", "name": "Nepal", "number": "524","countryCode":"+977"},
        {"code": "NL", "code3": "NLD", "name": "Netherlands (the)", "number": "528","countryCode":"+31"},
        {"code": "NC", "code3": "NCL", "name": "New Caledonia", "number": "540","countryCode":"+687"},
        {"code": "NZ", "code3": "NZL", "name": "New Zealand", "number": "554","countryCode":"+64"},
        {"code": "NI", "code3": "NIC", "name": "Nicaragua", "number": "558","countryCode":"+505"},
        {"code": "NE", "code3": "NER", "name": "Niger (the)", "number": "562","countryCode":"+227"},
        {"code": "NG", "code3": "NGA", "name": "Nigeria", "number": "566","countryCode":"+234"},
        {"code": "NU", "code3": "NIU", "name": "Niue", "number": "570","countryCode":"+683"},
        {"code": "NF", "code3": "NFK", "name": "Norfolk Island", "number": "574","countryCode":"+672"},
        {"code": "MP", "code3": "MNP", "name": "Northern Mariana Islands (the)", "number": "580","countryCode":"+1670"},
        {"code": "NO", "code3": "NOR", "name": "Norway", "number": "578","countryCode":"+47"},
        {"code": "OM", "code3": "OMN", "name": "Oman", "number": "512","countryCode":"+968"},
        {"code": "PK", "code3": "PAK", "name": "Pakistan", "number": "586","countryCode":"+92"},
        {"code": "PW", "code3": "PLW", "name": "Palau", "number": "585","countryCode":"+680"},
        {"code": "PS", "code3": "PSE", "name": "Palestine, State of", "number": "275","countryCode":"+970"},
        {"code": "PA", "code3": "PAN", "name": "Panama", "number": "591","countryCode":"+507"},
        {"code": "PG", "code3": "PNG", "name": "Papua New Guinea", "number": "598","countryCode":"+675"},
        {"code": "PY", "code3": "PRY", "name": "Paraguay", "number": "600","countryCode":"+595"},
        {"code": "PE", "code3": "PER", "name": "Peru", "number": "604","countryCode":"+51"},
        {"code": "PH", "code3": "PHL", "name": "Philippines (the)", "number": "608","countryCode":"+63"},
        {"code": "PN", "code3": "PCN", "name": "Pitcairn", "number": "612","countryCode":"+64"},
        {"code": "PL", "code3": "POL", "name": "Poland", "number": "616","countryCode":"+48"},
        {"code": "PT", "code3": "PRT", "name": "Portugal", "number": "620","countryCode":"+351"},
        {"code": "PR", "code3": "PRI", "name": "Puerto Rico", "number": "630","countryCode":"+1939"},
        {"code": "QA", "code3": "QAT", "name": "Qatar", "number": "634","countryCode":"+974"},
        {"code": "MK", "code3": "MKD", "name": "Republic of North Macedonia", "number": "807","countryCode":"+389"},
        {"code": "RO", "code3": "ROU", "name": "Romania", "number": "642","countryCode":"+40"},
        {"code": "RU", "code3": "RUS", "name": "Russian Federation (the)", "number": "643","countryCode":"+7"},
        {"code": "RW", "code3": "RWA", "name": "Rwanda", "number": "646","countryCode":"+250"},
        {"code": "RE", "code3": "REU", "name": "Réunion", "number": "638","countryCode":"+262"},
        {"code": "BL", "code3": "BLM", "name": "Saint Barthélemy", "number": "652","countryCode":"+590"},
        {"code": "SH", "code3": "SHN", "name": "Saint Helena, Ascension and Tristan da Cunha", "number": "654","countryCode":"+290"},
        {"code": "KN", "code3": "KNA", "name": "Saint Kitts and Nevis", "number": "659","countryCode":"+1869"},
        {"code": "LC", "code3": "LCA", "name": "Saint Lucia", "number": "662","countryCode":"+1758"},
        {"code": "MF", "code3": "MAF", "name": "Saint Martin (French part)", "number": "663","countryCode":"+590"},
        {"code": "PM", "code3": "SPM", "name": "Saint Pierre and Miquelon", "number": "666","countryCode":"+508"},
        {"code": "VC", "code3": "VCT", "name": "Saint Vincent and the Grenadines", "number": "670","countryCode":"+1784"},
        {"code": "WS", "code3": "WSM", "name": "Samoa", "number": "882","countryCode":"+685"},
        {"code": "SM", "code3": "SMR", "name": "San Marino", "number": "674","countryCode":"+378"},
        {"code": "ST", "code3": "STP", "name": "Sao Tome and Principe", "number": "678","countryCode":"+239"},
        {"code": "SA", "code3": "SAU", "name": "Saudi Arabia", "number": "682","countryCode":"+966"},
        {"code": "SN", "code3": "SEN", "name": "Senegal", "number": "686","countryCode":"+221"},
        {"code": "RS", "code3": "SRB", "name": "Serbia", "number": "688","countryCode":"+381"},
        {"code": "SC", "code3": "SYC", "name": "Seychelles", "number": "690","countryCode":"+248"},
        {"code": "SL", "code3": "SLE", "name": "Sierra Leone", "number": "694","countryCode":"+232"},
        {"code": "SG", "code3": "SGP", "name": "Singapore", "number": "702","countryCode":"+65"},
        {"code": "SX", "code3": "SXM", "name": "Sint Maarten (Dutch part)", "number": "534","countryCode":"+1721"},
        {"code": "SK", "code3": "SVK", "name": "Slovakia", "number": "703","countryCode":"+421"},
        {"code": "SI", "code3": "SVN", "name": "Slovenia", "number": "705","countryCode":"+386"},
        {"code": "SB", "code3": "SLB", "name": "Solomon Islands", "number": "090","countryCode":"+677"},
        {"code": "SO", "code3": "SOM", "name": "Somalia", "number": "706","countryCode":"+252"},
        {"code": "ZA", "code3": "ZAF", "name": "South Africa", "number": "710","countryCode":"+27"},
        {"code": "GS", "code3": "SGS", "name": "South Georgia and the South Sandwich Islands", "number": "239","countryCode":"+500"},
        {"code": "SS", "code3": "SSD", "name": "South Sudan", "number": "728","countryCode":"+211"},
        {"code": "ES", "code3": "ESP", "name": "Spain", "number": "724","countryCode":"+34"},
        {"code": "LK", "code3": "LKA", "name": "Sri Lanka", "number": "144","countryCode":"+94"},
        {"code": "SD", "code3": "SDN", "name": "Sudan (the)", "number": "729","countryCode":"+249"},
        {"code": "SR", "code3": "SUR", "name": "Suriname", "number": "740","countryCode":"+597"},
        {"code": "SJ", "code3": "SJM", "name": "Svalbard and Jan Mayen", "number": "744","countryCode":"+47"},
        {"code": "SE", "code3": "SWE", "name": "Sweden", "number": "752","countryCode":"+46"},
        {"code": "CH", "code3": "CHE", "name": "Switzerland", "number": "756","countryCode":"+41"},
        {"code": "SY", "code3": "SYR", "name": "Syrian Arab Republic", "number": "760","countryCode":"+963"},
        {"code": "TW", "code3": "TWN", "name": "Taiwan", "number": "158","countryCode":"+886"},
        {"code": "TJ", "code3": "TJK", "name": "Tajikistan", "number": "762","countryCode":"+992"},
        {"code": "TZ", "code3": "TZA", "name": "Tanzania, United Republic of", "number": "834","countryCode":"+255"},
        {"code": "TH", "code3": "THA", "name": "Thailand", "number": "764","countryCode":"+66"},
        {"code": "TL", "code3": "TLS", "name": "Timor-Leste", "number": "626","countryCode":"+670"},
        {"code": "TG", "code3": "TGO", "name": "Togo", "number": "768","countryCode":"+228"},
        {"code": "TK", "code3": "TKL", "name": "Tokelau", "number": "772","countryCode":"+690"},
        {"code": "TO", "code3": "TON", "name": "Tonga", "number": "776","countryCode":"+676"},
        {"code": "TT", "code3": "TTO", "name": "Trinidad and Tobago", "number": "780","countryCode":"+1868"},
        {"code": "TN", "code3": "TUN", "name": "Tunisia", "number": "788","countryCode":"+216"},
        {"code": "TR", "code3": "TUR", "name": "Turkey", "number": "792","countryCode":"+90"},
        {"code": "TM", "code3": "TKM", "name": "Turkmenistan", "number": "795","countryCode":"+993"},
        {"code": "TC", "code3": "TCA", "name": "Turks and Caicos Islands (the)", "number": "796","countryCode":"+1649"},
        {"code": "TV", "code3": "TUV", "name": "Tuvalu", "number": "798","countryCode":"+688"},
        {"code": "UG", "code3": "UGA", "name": "Uganda", "number": "800","countryCode":"+256"},
        {"code": "UA", "code3": "UKR", "name": "Ukraine", "number": "804","countryCode":"+380"},
        {"code": "AE", "code3": "ARE", "name": "United Arab Emirates (the)", "number": "784","countryCode":"+971"},
        {"code": "GB", "code3": "GBR", "name": "United Kingdom of Great Britain and Northern Ireland (the)", "number": "826","countryCode":"+44"},
        {"code": "UM", "code3": "UMI", "name": "United States Minor Outlying Islands (the)", "number": "581","countryCode":"+93"},
        {"code": "US", "code3": "USA", "name": "United States of America", "number": "840","countryCode":"+1"},
        {"code": "UY", "code3": "URY", "name": "Uruguay", "number": "858","countryCode":"+598"},
        {"code": "UZ", "code3": "UZB", "name": "Uzbekistan)", "number": "860","countryCode":"+998"},
        {"code": "VU", "code3": "VUT", "name": "Vanuatu", "number": "548","countryCode":"+678"},
        {"code": "VE", "code3": "VEN", "name": "Venezuela (Bolivarian Republic of)", "number": "862","countryCode":"+58"},
        {"code": "VN", "code3": "VNM", "name": "Viet Nam", "number": "704","countryCode":"+84"},
        {"code": "VG", "code3": "VGB", "name": "Virgin Islands (British)", "number": "092","countryCode":"+1"},
        {"code": "VI", "code3": "VIR", "name": "Virgin Islands (U.S.)", "number": "850","countryCode":"+1"},
        {"code": "WF", "code3": "WLF", "name": "Wallis and Futuna", "number": "876","countryCode":"+681"},
        {"code": "EH", "code3": "ESH", "name": "Western Sahara", "number": "732","countryCode":"+212"},
        {"code": "YE", "code3": "YEM", "name": "Yemen", "number": "887","countryCode":"+967"},
        {"code": "ZM", "code3": "ZMB", "name": "Zambia", "number": "894","countryCode":"+260"},
        {"code": "ZW", "code3": "ZWE", "name": "Zimbabwe", "number": "716","countryCode":"+263"},
        {"code": "AX", "code3": "ALA", "name": "Åland Islands", "number": "248","countryCode":"+358"}
    ];
}