import * as React from "react";
import { useState,useEffect } from 'react';
import {ApplicationCustomizerContext} from "@microsoft/sp-application-base";
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react/lib/Breadcrumb';
import { SPHttpClient, HttpClientResponse } from "@microsoft/sp-http";
import axios from 'axios';

export interface SiteBreadcrumbProps {
    context: ApplicationCustomizerContext;
    styles: any;
    count: number;
  }  
  export interface IWebInfo {
    Id: string;
    Title: string;
    ServerRelativeUrl: string;
    error?: any;
  }
  

export const SiteBreadcrumb = ({context,styles, count}: SiteBreadcrumbProps , ) => {
    const [ breadcrumbItems, setbreadcrumbItems ] = useState<IBreadcrumbItem[]>([]);
    let linkItems = [];
    let hubSet = false;

    const setHubSite = async () => {
        //if the current site is not the hub then add the hub first >
        if(!hubSet){
          let isHub = await context.pageContext.legacyPageContext.isHubSite;
          if(!isHub){
              let hubId = context.pageContext.legacyPageContext.hubSiteId;
              const hubSiteGetUrl = `${context.pageContext.site.absoluteUrl}/_api/hubsites/GetById?hubSiteId='${hubId}'`;
              let hubData = await axios.get(hubSiteGetUrl);
              if(hubData.data.Title != null && linkItems[0].text.toUpperCase() !== hubData.data.Title.toUpperCase()){
                linkItems.unshift({
                    text: hubData.data.Title, //hubProps[0].Value,
                    key: "0",
                    href: hubData.data.SiteUrl, //hubProps[1].Value,
                    isCurrentItem: false
                });
                hubSet = true;
              }
              else{
                console.log("ERROR Breadcrumb application customizer: no HUB site found");
              }
          }
          setbreadcrumbItems(linkItems);
        }
      };

      /**
       * Retrieve the parent web URLs
       * @param webUrl Current URL of the web to process
       */
      const getParentWeb = (webUrl: string) =>{
        // Retrieve the parent web info
        const apiUrl = `${webUrl}/_api/web/parentweb?$select=Id,Title,ServerRelativeUrl`;
        context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1)
          .then((response: HttpClientResponse) => {
            return response.json();
          })
          .then((webInfo: IWebInfo) => {
            if (!webInfo.error) {
              // Check if the correct data is retrieved
              if (!webInfo.ServerRelativeUrl && !webInfo.Title) {
                return;
              }
    
              // Store the current site
              linkItems.unshift({
                text: webInfo.Title,
                key: webInfo.Id,
                href: webInfo.ServerRelativeUrl
              });
    
              // Check if you retrieved all the information up until the root site
              if (webInfo.ServerRelativeUrl === context.pageContext.site.serverRelativeUrl) {
                setHubSite();
              } else {
                // retrieve the information from the parent site
                webUrl = webUrl.substring(0, (webUrl.indexOf(`${webInfo.ServerRelativeUrl}/`) + webInfo.ServerRelativeUrl.length));
                getParentWeb(webUrl);
              }
            } else {
              // Set the current breadcrumb data which is already retrieved
                setHubSite(); //not this one
            }
          });
      };
    
      /**
       * Start the link generation for the breadcrumb
       */
      const generateLinks =async ()=> {
        linkItems = [];
        setbreadcrumbItems([]);
        // Add the current site to the links list
          linkItems.push({
                text: context.pageContext.web.title,
                key: context.pageContext.web.id.toString(),
                href: context.pageContext.web.absoluteUrl,
                isCurrentItem: !!context.pageContext.list.serverRelativeUrl
            });
    
        // Check if the current list URL is available
        if (!!context.pageContext.list.serverRelativeUrl) {
          // Add the current list to the links list
          if(context.pageContext.list.title !== "Site Pages"){
            linkItems.push({
              text: context.pageContext.list.title,
              key: context.pageContext.list.id.toString(),
              href: context.pageContext.list.serverRelativeUrl,
              isCurrentItem: true
            });
          }
        }
    
        // Check if you are already on the root site
        if (context.pageContext.site.serverRelativeUrl === context.pageContext.web.serverRelativeUrl) {
            setHubSite();
        } else {
            // Retrieve the parent webs information
            getParentWeb(context.pageContext.web.absoluteUrl);
        }
      };
      
    useEffect(() => {
      generateLinks();
    }, [count]);

    return (
        <div className={styles.breadcrumb} >
        <div className={styles.msBgColorThemePrimary}>
        {breadcrumbItems.length > 0 ? 
          <Breadcrumb
            items={breadcrumbItems}
            ariaLabel={'Breadcrumb navigation'}
            className={styles.breadcrumbLinks} />
          :null
          }
        </div>
      </div >
    );
};
export default SiteBreadcrumb;
