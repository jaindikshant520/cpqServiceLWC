/*------------------------------------------------------------------------------
* Project Name..........: <<Workday Support Lightning>>
* File..................: <<LWCEscalateCaseClass>>
* Version...............: <<1.0>>
============================================================================================================
Purpose:
---------
This class is used for escalate case in community.
============================================================================================================
History
-------
VERSION     AUTHOR              DATE            DETAIL                              Change Request
1.0         Dikshant Jain       17-Jan-22       GTMSER-8307 (Channel Partner) Education Case: Lightning Enhancements for Education Training Case Escalation, Case Closing, and Managing Case Team for Channel Partners

*************************************************************************************************************/
public class LWCEscalateCaseClass {
    public id escCaseCommentId{get;set;}
    public String escalationComment{get;set;}
    public Case theCase{get;set;}
    public boolean error{get; set;}
    private String escCaseRequestInfo{get;set;}

    @AuraEnabled
    public static void addCaseComment(string jsonLWCEscalate){
        LWCEscalateWrapper objLWCEscalationWrapper = (LWCEscalateWrapper)JSON.deserialize(jsonLWCEscalate,LWCEscalateWrapper.Class);
        Case objCase = [Select Notify_contact_on_case_close__c,Product__c,Sub_Product__c,Area__c,Sub_Area__c,
        Escalation_Status__c,Re_Escalated_Date_Time__c,Public_Case_Comment_Ids__c,Case_Escalation_Comment_Ids__c,
        Partner_Escalation_Requestor_Email__c,Customer_Escalation_Requestor_Email__c,Internal_Escalation_Requester_Email__c ,
        Id, Contact.Id, Contact.Name, Follow_up_Date__c, Status, Sub_Status__c,ParentId, Case_Type__c, CreatedBy.Id,
        CreatedBy.Name, CreatedBy.UserType, CreatedBy.IsActive, CreatedBy.Email, IsEscalated, CreatedById,
        Escalated_Case__c, CaseNumber, Escalation_Resolution__c, Escalation_Requestor__c, Contact_Method_for__c,
        Escalation_Reason__c, Escalation_Owner__c, Escalation_Justification__c, AccountId, Subject, Description,
        contact.support_relationship__c, RecordType.Name, Co_Source_Customer__c,Closed_Reason__c, escalation_count__c,
        Re_Escalation_Counter__c,Total_Re_escalation_Counter__c,Root_Cause__c,Reviewed_by_Analyst__c,
        Target_Update_Changed__c, Resolution_Summary__c
        from Case where id=:objLWCEscalationWrapper.caseId];
        System.debug('objcase status:' + objCase.Status);
        objCase.Escalated_Case__c = true;
        objCase.IsEscalated = true;
        CaseComment escComment = new CaseComment();
        if(objLWCEscalationWrapper!=null){
            escComment.parentId = objLWCEscalationWrapper.caseId;
            escComment.IsPublished = true;
            escComment.CommentBody = 'Escalated: ';
            if(objLWCEscalationWrapper.requestCall){
                escComment.CommentBody += 'CALL REQUESTED: '+objLWCEscalationWrapper.other +'\n';
            }
           if(String.isblank(objLWCEscalationWrapper.escalationStatus)){
                escComment.CommentBody += objLWCEscalationWrapper.escalationJustification;
                objCase.Escalation_Status__c = 'Requested';
                objCase.Escalation_Requestor__c = UserInfo.getUserId();
                objCase.Escalation_Count__c  = objCase.Escalation_Count__c==null?1:(objCase.Escalation_Count__c+1);
                objCase.Re_Escalation_Counter__c = 0;
                objCase.Date_Time_Escalation__c = system.now();
            }else{
                objCase.Re_Escalation_Counter__c = objCase.Re_Escalation_Counter__c+1;
                objCase.Total_Re_escalation_Counter__c =(objCase.Total_Re_escalation_Counter__c==null?1:objCase.Total_Re_escalation_Counter__c+1);                       
                objCase.Re_Escalated_Date_Time__c = System.now();
            }

            CaseCommentTriggerHelper.skipEscalationEmail = true;
            insert escComment;

            if(escComment!=null){
                objCase.AttentionRequiredEscalatedCase__c = true;
                objCase.Escalation_Requestor__c = UserInfo.getUserId();
                objCase.Date_Time_Escalation__c = system.now();
                objCase.Customer_Escalation_Requestor_Email__c='';
                objCase.Partner_Escalation_Requestor_Email__c='';
                objCase.Internal_Escalation_Requester_Email__c = '';
                objCase.Id = objLWCEscalationWrapper.CaseId;
                if(objLWCEscalationWrapper.escalationReason != null || objLWCEscalationWrapper.escalationReason !=''){
                    objCase.Escalation_Reason__c = objLWCEscalationWrapper.escalationReason;
                }
                if(objLWCEscalationWrapper.escalationJustification != null || objLWCEscalationWrapper.escalationJustification != ''){
                    objCase.Escalation_Justification__c = objLWCEscalationWrapper.escalationJustification;
                }
                if(String.isblank(objLWCEscalationWrapper.escalationStatus)){
                    objCase.Escalation_Status__c = 'Requested';
                    objCase.Escalation_Count__c  = objCase.Escalation_Count__c==null?1:(objCase.Escalation_Count__c+1);
                    objCase.Re_Escalation_Counter__c = 0;
                    objCase.Date_Time_Escalation__c = system.now();
                }else{
                    objCase.Re_Escalation_Counter__c = objCase.Re_Escalation_Counter__c+1;
                    objCase.Total_Re_escalation_Counter__c =(objCase.Total_Re_escalation_Counter__c==null?1:objCase.Total_Re_escalation_Counter__c+1);                       
                    objCase.Re_Escalated_Date_Time__c = System.now();
                }

                if(UserInfo.getUserType()=='PowerPartner'){
                    objCase.Partner_User_Escalator__c      = UserInfo.getUserId();
                    objCase.Partner_Case_Creator_Emaiil__c = objCase.CreatedBy.email;
                }
                else if(UserInfo.getUserType()=='PowerCustomerSuccess' || UserInfo.getUserType()=='CustomerSuccess'){
                    objCase.Customer_User_Escalator__c  = UserInfo.getUserId();
                }
                else if(Utility.isProfileEcoSystemProfile()==true){
                    objCase.Ecosys_User_Escalator__c  = UserInfo.getUserId();
                }
                if(objCase.Case_Escalation_Comment_Ids__c!=null){
                    objCase.Case_Escalation_Comment_Ids__c = objCase.Case_Escalation_Comment_Ids__c + escComment.Id + ';';
                }else{
                    objCase.Case_Escalation_Comment_Ids__c = escComment.Id + ';';
                }
                objCase.Case_Escalation_Requested_Information__c  = 'CALL REQUESTED: '+objLWCEscalationWrapper.other;
            }
             database.Saveresult saveResult = database.update(objCase,false);
             system.debug('saveResults3 :: '+saveResult);
             integer i =0;
                if(saveResult.isSuccess()==false){
                    for(Database.Error err : saveResult.getErrors()){
                    throw new AuraException(err.getMessage());
                    }
                }
        }
    }

    public class LWCEscalateWrapper{
        @Auraenabled public string phone;
        @Auraenabled public string mobile;
        @Auraenabled public string other;
        @Auraenabled public boolean requestCall;
        @Auraenabled public string escalationStatus;
        @Auraenabled public string escalationReason;
        @Auraenabled public string escalationJustification;
        @Auraenabled public Integer escalationCount;
        @Auraenabled public Integer totalEscalationCount;
        @Auraenabled public Integer reEscalationCount;
        @Auraenabled public string caseId;
    }

    @AuraEnabled
    public static String fetchEscalationStatus(ID caseId){
        Case objCaseRecord = [SELECT Id,Status,CaseNumber,Escalation_Status__c,Escalation_Reason__c,Contact.Phone,Contact.MobilePhone,
                                Contact.OtherPhone from Case where id=:caseId];
        passValueWrapper pasWrapp = new passValueWrapper();
        pasWrapp.Status = objCaseRecord.Status;
        pasWrapp.CaseNumber = objCaseRecord.CaseNumber;
        pasWrapp.escalationStatus = objCaseRecord.Escalation_Status__c;
        pasWrapp.phone = objCaseRecord.Contact.Phone;
        pasWrapp.mobile = objCaseRecord.Contact.MobilePhone;
        pasWrapp.otherPhone = objCaseRecord.Contact.OtherPhone;
        pasWrapp.escalationReason = objCaseRecord.Escalation_Reason__c;
        return JSON.serialize(pasWrapp);
    }
    public class passValueWrapper{
        @Auraenabled public string Status;
        @Auraenabled public string CaseNumber;
        @Auraenabled public string escalationStatus;
        @Auraenabled public string phone;
        @Auraenabled public string mobile;
        @Auraenabled public string otherPhone;
        @Auraenabled public string escalationReason;
    }
}