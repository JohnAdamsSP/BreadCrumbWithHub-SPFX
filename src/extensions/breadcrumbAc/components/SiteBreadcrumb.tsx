import * as React from "react";
import { ISiteBreadcrumbProps } from "./ISiteBreadcrumb";
import styles from './SiteBreadcrumb.module.scss';
import './sharePointStyleChanges.css';
import SiteBreadcrumb from "./Links/index";

export const BreadCrumbContainer = ({context, count}: ISiteBreadcrumbProps, ) => {
    return (
      <SiteBreadcrumb context={context} count={count} styles={styles}/>
    );
};
export default BreadCrumbContainer;
