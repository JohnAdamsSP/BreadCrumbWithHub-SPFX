import * as React from "react";
import * as ReactDom from 'react-dom';
import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';
import * as strings from 'BreadcrumbAcApplicationCustomizerStrings';
import BreadCrumbContainer from './components/SiteBreadcrumb';
import { ISiteBreadcrumbProps } from './components/ISiteBreadcrumb';

const LOG_SOURCE: string = 'BreadcrumbAcApplicationCustomizer';
let count = 0;

export interface IBreadcrumbAcApplicationCustomizerProperties {
  testMessage: string;
}

export default class BreadcrumbAcApplicationCustomizer extends BaseApplicationCustomizer<IBreadcrumbAcApplicationCustomizerProperties> {
  private static headerPlaceholder: PlaceholderContent;
  

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    this.context.application.navigatedEvent.add(this, this.render);
    return Promise.resolve();
  }

  private startReactRender() {    
    if (BreadcrumbAcApplicationCustomizer.headerPlaceholder && BreadcrumbAcApplicationCustomizer.headerPlaceholder.domElement) {
      count++;
      const element: React.ReactElement<ISiteBreadcrumbProps> = React.createElement(BreadCrumbContainer, {
        context: this.context,
        count:count
      });
      ReactDom.render(element, BreadcrumbAcApplicationCustomizer.headerPlaceholder.domElement);
    } else {
      console.log('DOM element of the header is undefined. Start to re-render.');
      this.render();
    }
  }

  public onDispose() {
    if (BreadcrumbAcApplicationCustomizer.headerPlaceholder && BreadcrumbAcApplicationCustomizer.headerPlaceholder.domElement){
      ReactDom.unmountComponentAtNode(BreadcrumbAcApplicationCustomizer.headerPlaceholder.domElement);
    }
  }

  private render() {
    if (this.context.placeholderProvider.placeholderNames.indexOf(PlaceholderName.Top) !== -1) {
      if (!BreadcrumbAcApplicationCustomizer.headerPlaceholder || !BreadcrumbAcApplicationCustomizer.headerPlaceholder.domElement) {
        BreadcrumbAcApplicationCustomizer.headerPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top, {
          onDispose: this.onDispose
        });
      }
      this.startReactRender();
    } else {
      console.log(`The following placeholder names are available`, this.context.placeholderProvider.placeholderNames);
    }
  }
}
