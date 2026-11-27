'use client';
import Script from 'next/script';
declare global {interface Window {SwaggerUIBundle:(options:Record<string,unknown>)=>unknown}}
export default function Swagger() { return <><link rel="stylesheet" href="/swagger/swagger-ui.css"/><div id="swagger-ui"/><Script src="/swagger/swagger-ui-bundle.js" onReady={()=>{window.SwaggerUIBundle({url:'/api/v1/openapi',dom_id:'#swagger-ui',persistAuthorization:false});}}/></>; }
