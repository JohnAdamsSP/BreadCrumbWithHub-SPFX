import {ApplicationCustomizerContext} from "@microsoft/sp-application-base";
import { IBreadcrumbItem } from "office-ui-fabric-react/lib";

export interface ISiteBreadcrumbProps {
  context: ApplicationCustomizerContext;
  count: number;
}

export interface ISiteBreadcrumbState {
  breadcrumbItems: IBreadcrumbItem[];
}

export interface IWebInfo {
  Id: string;
  Title: string;
  ServerRelativeUrl: string;
  error?: any;
}
