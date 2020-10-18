import React from "react";
import "./NavBar.css";
import { Navbar, NavItem } from 'react-materialize';

const NavBar = props => (

    <Navbar brand={<img id="logo" src="uploads/logo.png" />} right>
        <NavItem href={"/create"}>Create</NavItem>
        <NavItem href={"/view"}>View</NavItem>
        <NavItem onClick={props.logOut} href={"/"}>{props.username}: Log Out</NavItem>
    </Navbar>
)

export default NavBar;