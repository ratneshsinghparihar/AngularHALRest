/// <reference path="../../../../typings/linq/linq.d.ts" />
/// <reference path="../../../../typings/angularjs/angular.d.ts" />

/// <reference path="../../../../typings/sprintf/sprintf.d.ts" />

/// <reference path="../../../../typings/angularjs/angular-route.d.ts" />
/// <reference path="../../../../typings/angularjs/angular-ui-router.d.ts" />
/// <reference path="../models/restrresponse.ts" />

module eBmr.common.services {


    export interface INotificationService {
        toastAndLogMessage(messageType: string, message: string, messageTitle?: string): void;
        logMessage(message: string): void;
        toastMessage(messageType: string, message: string, messageTitle: string): void;
    }

    export interface IImpotExportService {
        importCsv(files: any, props: any): ng.IPromise<any>;
        exportCsv(dtos: any, fileName: string, newDto: any): ng.IPromise<any>;
    }

    export interface IMasterDataHelperService {
        masterDataEnum: any;
        getUnitTypes(callback: any): ng.IPromise<any>;
        getSpecifications(callback: any): ng.IPromise<any>;
        getProducttypes(callback: any): ng.IPromise<any>;
        getStages(callback: any): ng.IPromise<any>;
    }

    export interface IAngularRest {
        updateItem(): ng.IPromise<any>;
        createItem(url: string): ng.IPromise<any>;
        createNew(rootUrl: string, dtoFn: any, params: any): any;
        deleteItem(): ng.IPromise<any>;
        getFromUrlList(urlDtoList: any): ng.IPromise<eBmr.models.RestResponse>;
        getFromUrl(url: string, dtoFn?: any): ng.IPromise<eBmr.models.RestResponse>;
        getFromUrlNested(url: string, dtoFn: any): ng.IPromise<eBmr.models.RestResponse>;
    }


}