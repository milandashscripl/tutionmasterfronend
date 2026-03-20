import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/api";

const AppSettingsContext = createContext();

export function AppSettingsProvider({ children }) {

const [settings,setSettings] = useState({
siteName:"TuitionMaster",
themeColor:"#6366f1",
fontFamily:"Poppins",
logo:null
});

const fetchSettings = async ()=>{

try{

const res = await API.get("admin/settings");

setSettings(res.data);

/* APPLY GLOBAL CSS */

document.documentElement.style.setProperty(
"--accent-1",
res.data.themeColor
);

document.body.style.fontFamily = res.data.fontFamily;

}catch(err){
console.log(err);
}

};

useEffect(()=>{
fetchSettings();
},[]);

return(

<AppSettingsContext.Provider value={{settings,fetchSettings}}>
{children}
</AppSettingsContext.Provider>

);

}

export const useAppSettings = ()=>useContext(AppSettingsContext);