public with sharing class ChatGPTMediatorCallout {
    @AuraEnabled
    public static OpneAI executePost(String endpoint, String body) {
      // Instantiate a new Http object
      Http http = new Http();

      // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
      HttpRequest req = new HttpRequest();
      req.setEndpoint(endpoint);
      //'https://openai-api-integrate-sfdc.herokuapp.com/chat'
      req.setMethod('POST');
      req.setHeader('Content-Type', 'application/json');
      req.setBody(body);
      req.setTimeout(120000);
      //'{"prompt":"JavaScriptについておしえて"}'

      // Send the request, and return a response
      HttpResponse res = http.send(req);
      OpneAI oAI = new OpneAI();
      if (res.getStatus() == 'OK') {
        System.debug(endpoint);
        System.debug(JSON.deserializeUntyped(res.getBody()));
        oAI = (OpneAI) JSON.deserializeStrict(res.getBody(), OpneAI.class);
        System.debug(oAI);
      }
      return oAI;
    }

    public class OpneAI {
      @AuraEnabled
      public String message;
    }
  }
