(this.webpackJsonpyourfoodcoach=this.webpackJsonpyourfoodcoach||[]).push([[10],{312:function(e,t,a){"use strict";var n=a(0);const s=n.createContext({});t.a=s},313:function(e,t,a){"use strict";var n=a(0),s=a(312),r=a(1);const c=n.forwardRef(((e,t)=>{let{controlId:a,as:c="div",...l}=e;const i=Object(n.useMemo)((()=>({controlId:a})),[a]);return Object(r.jsx)(s.a.Provider,{value:i,children:Object(r.jsx)(c,{...l,ref:t})})}));c.displayName="FormGroup",t.a=c},314:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(312),l=a(6),i=a(1);const o=r.forwardRef(((e,t)=>{let{id:a,bsPrefix:n,className:o,type:d="checkbox",isValid:m=!1,isInvalid:f=!1,as:u="input",...j}=e;const{controlId:h}=Object(r.useContext)(c.a);return n=Object(l.c)(n,"form-check-input"),Object(i.jsx)(u,{...j,ref:t,type:d,id:a||h,className:s()(o,n,m&&"is-valid",f&&"is-invalid")})}));o.displayName="FormCheckInput",t.a=o},315:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(6),l=a(1);const i=r.forwardRef(((e,t)=>{const[{className:a,...n},{as:r="div",bsPrefix:i,spans:o}]=function(e){let{as:t,bsPrefix:a,className:n,...r}=e;a=Object(c.c)(a,"col");const l=Object(c.a)(),i=Object(c.b)(),o=[],d=[];return l.forEach((e=>{const t=r[e];let n,s,c;delete r[e],"object"===typeof t&&null!=t?({span:n,offset:s,order:c}=t):n=t;const l=e!==i?"-".concat(e):"";n&&o.push(!0===n?"".concat(a).concat(l):"".concat(a).concat(l,"-").concat(n)),null!=c&&d.push("order".concat(l,"-").concat(c)),null!=s&&d.push("offset".concat(l,"-").concat(s))})),[{...r,className:s()(n,...o,...d)},{as:t,bsPrefix:a,spans:o}]}(e);return Object(l.jsx)(r,{...n,ref:t,className:s()(a,!o.length&&i)})}));i.displayName="Col",t.a=i},316:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(313),l=a(6),i=a(1);const o=r.forwardRef(((e,t)=>{let{bsPrefix:a,className:n,children:r,controlId:o,label:d,...m}=e;return a=Object(l.c)(a,"form-floating"),Object(i.jsxs)(c.a,{ref:t,className:s()(n,a),controlId:o,...m,children:[r,Object(i.jsx)("label",{htmlFor:o,children:d})]})}));o.displayName="FloatingLabel",t.a=o},321:function(e,t,a){"use strict";var n=a(0),s=a(323),r=a(1);t.a=e=>{let{itemsCount:t,itemsPerPage:a,currentPage:c,setCurrentPage:l,alwaysShown:i=!0}=e;const o=Math.ceil(t/a),d=!!i||o>1,m=1===c,f=c===o,u=e=>{c!==e&&l(e)};let j;const h=[...new Array(o)].map(((e,t)=>{const a=t+1,n=1===a,l=a===o,i=Math.abs(a-c)<=2;return n||l||i?(j=!1,Object(r.jsx)(s.a.Item,{active:a===c,onClick:()=>(e=>{u(e)})(a),children:a},a)):j?null:(j=!0,Object(r.jsx)(s.a.Ellipsis,{className:"muted"},a))}));return Object(n.useEffect)((()=>{c>o&&l(o)}),[o]),Object(r.jsx)(r.Fragment,{children:d&&Object(r.jsxs)(s.a,{children:[Object(r.jsx)(s.a.Prev,{onClick:()=>{u((e=>e-1))},disabled:m}),h,Object(r.jsx)(s.a.Next,{onClick:()=>{u((e=>e+1))},disabled:f})]})})}},323:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(6),l=a(55),i=a(1);const o=r.forwardRef(((e,t)=>{let{active:a=!1,disabled:n=!1,className:r,style:c,activeLabel:o="(current)",children:d,linkStyle:m,linkClassName:f,...u}=e;const j=a||n?"span":l.a;return Object(i.jsx)("li",{ref:t,style:c,className:s()(r,"page-item",{active:a,disabled:n}),children:Object(i.jsxs)(j,{className:s()("page-link",f),style:m,...u,children:[d,a&&o&&Object(i.jsx)("span",{className:"visually-hidden",children:o})]})})}));o.displayName="PageItem";var d=o;function m(e,t){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e;const n=r.forwardRef(((e,n)=>{let{children:s,...r}=e;return Object(i.jsxs)(o,{...r,ref:n,children:[Object(i.jsx)("span",{"aria-hidden":"true",children:s||t}),Object(i.jsx)("span",{className:"visually-hidden",children:a})]})}));return n.displayName=e,n}const f=m("First","\xab"),u=m("Prev","\u2039","Previous"),j=m("Ellipsis","\u2026","More"),h=m("Next","\u203a"),b=m("Last","\xbb"),p=r.forwardRef(((e,t)=>{let{bsPrefix:a,className:n,size:r,...l}=e;const o=Object(c.c)(a,"pagination");return Object(i.jsx)("ul",{ref:t,...l,className:s()(n,o,r&&"".concat(o,"-").concat(r))})}));p.displayName="Pagination";t.a=Object.assign(p,{First:f,Prev:u,Ellipsis:j,Item:d,Next:h,Last:b})},325:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(8),c=a.n(r),l=a(0),i=a(1);const o={type:c.a.string,tooltip:c.a.bool,as:c.a.elementType},d=l.forwardRef(((e,t)=>{let{as:a="div",className:n,type:r="valid",tooltip:c=!1,...l}=e;return Object(i.jsx)(a,{...l,ref:t,className:s()(n,"".concat(r,"-").concat(c?"tooltip":"feedback"))})}));d.displayName="Feedback",d.propTypes=o;var m=d,f=a(314),u=a(312),j=a(6);const h=l.forwardRef(((e,t)=>{let{bsPrefix:a,className:n,htmlFor:r,...c}=e;const{controlId:o}=Object(l.useContext)(u.a);return a=Object(j.c)(a,"form-check-label"),Object(i.jsx)("label",{...c,ref:t,htmlFor:r||o,className:s()(n,a)})}));h.displayName="FormCheckLabel";var b=h;const p=l.forwardRef(((e,t)=>{let{id:a,bsPrefix:n,bsSwitchPrefix:r,inline:c=!1,reverse:o=!1,disabled:d=!1,isValid:h=!1,isInvalid:p=!1,feedbackTooltip:x=!1,feedback:k,feedbackType:g,className:O,style:y,title:v="",type:E="checkbox",label:N,children:L,as:w="input",...R}=e;n=Object(j.c)(n,"form-check"),r=Object(j.c)(r,"form-switch");const{controlId:H}=Object(l.useContext)(u.a),P=Object(l.useMemo)((()=>({controlId:a||H})),[H,a]),S=!L&&null!=N&&!1!==N||function(e,t){return l.Children.toArray(e).some((e=>l.isValidElement(e)&&e.type===t))}(L,b),I=Object(i.jsx)(f.a,{...R,type:"switch"===E?"checkbox":E,ref:t,isValid:h,isInvalid:p,disabled:d,as:w});return Object(i.jsx)(u.a.Provider,{value:P,children:Object(i.jsx)("div",{style:y,className:s()(O,S&&n,c&&"".concat(n,"-inline"),o&&"".concat(n,"-reverse"),"switch"===E&&r),children:L||Object(i.jsxs)(i.Fragment,{children:[I,S&&Object(i.jsx)(b,{title:v,children:N}),k&&Object(i.jsx)(m,{type:g,tooltip:x,children:k})]})})})}));p.displayName="FormCheck";var x=Object.assign(p,{Input:f.a,Label:b});a(100);const k=l.forwardRef(((e,t)=>{let{bsPrefix:a,type:n,size:r,htmlSize:c,id:o,className:d,isValid:m=!1,isInvalid:f=!1,plaintext:h,readOnly:b,as:p="input",...x}=e;const{controlId:k}=Object(l.useContext)(u.a);return a=Object(j.c)(a,"form-control"),Object(i.jsx)(p,{...x,type:n,size:c,ref:t,readOnly:b,id:o||k,className:s()(d,h?"".concat(a,"-plaintext"):a,r&&"".concat(a,"-").concat(r),"color"===n&&"".concat(a,"-color"),m&&"is-valid",f&&"is-invalid")})}));k.displayName="FormControl";var g=Object.assign(k,{Feedback:m});const O=l.forwardRef(((e,t)=>{let{className:a,bsPrefix:n,as:r="div",...c}=e;return n=Object(j.c)(n,"form-floating"),Object(i.jsx)(r,{ref:t,className:s()(a,n),...c})}));O.displayName="FormFloating";var y=O,v=a(313),E=a(315);const N=l.forwardRef(((e,t)=>{let{as:a="label",bsPrefix:n,column:r=!1,visuallyHidden:c=!1,className:o,htmlFor:d,...m}=e;const{controlId:f}=Object(l.useContext)(u.a);n=Object(j.c)(n,"form-label");let h="col-form-label";"string"===typeof r&&(h="".concat(h," ").concat(h,"-").concat(r));const b=s()(o,n,c&&"visually-hidden",r&&h);return d=d||f,r?Object(i.jsx)(E.a,{ref:t,as:"label",className:b,htmlFor:d,...m}):Object(i.jsx)(a,{ref:t,className:b,htmlFor:d,...m})}));N.displayName="FormLabel";var L=N;const w=l.forwardRef(((e,t)=>{let{bsPrefix:a,className:n,id:r,...c}=e;const{controlId:o}=Object(l.useContext)(u.a);return a=Object(j.c)(a,"form-range"),Object(i.jsx)("input",{...c,type:"range",ref:t,className:s()(n,a),id:r||o})}));w.displayName="FormRange";var R=w;const H=l.forwardRef(((e,t)=>{let{bsPrefix:a,size:n,htmlSize:r,className:c,isValid:o=!1,isInvalid:d=!1,id:m,...f}=e;const{controlId:h}=Object(l.useContext)(u.a);return a=Object(j.c)(a,"form-select"),Object(i.jsx)("select",{...f,size:r,ref:t,className:s()(c,a,n&&"".concat(a,"-").concat(n),o&&"is-valid",d&&"is-invalid"),id:m||h})}));H.displayName="FormSelect";var P=H;const S=l.forwardRef(((e,t)=>{let{bsPrefix:a,className:n,as:r="small",muted:c,...l}=e;return a=Object(j.c)(a,"form-text"),Object(i.jsx)(r,{...l,ref:t,className:s()(n,a,c&&"text-muted")})}));S.displayName="FormText";var I=S;const z=l.forwardRef(((e,t)=>Object(i.jsx)(x,{...e,ref:t,type:"switch"})));z.displayName="Switch";var W=Object.assign(z,{Input:x.Input,Label:x.Label}),C=a(316);const F={_ref:c.a.any,validated:c.a.bool,as:c.a.elementType},U=l.forwardRef(((e,t)=>{let{className:a,validated:n,as:r="form",...c}=e;return Object(i.jsx)(r,{...c,ref:t,className:s()(a,n&&"was-validated")})}));U.displayName="Form",U.propTypes=F;t.a=Object.assign(U,{Group:v.a,Control:g,Floating:y,Check:x,Switch:W,Label:L,Text:I,Range:R,Select:P,FloatingLabel:C.a})},335:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(6),l=a(314),i=a(81),o=a(1);const d=r.forwardRef(((e,t)=>{let{className:a,bsPrefix:n,as:r="span",...l}=e;return n=Object(c.c)(n,"input-group-text"),Object(o.jsx)(r,{ref:t,className:s()(a,n),...l})}));d.displayName="InputGroupText";var m=d;const f=r.forwardRef(((e,t)=>{let{bsPrefix:a,size:n,hasValidation:l,className:d,as:m="div",...f}=e;a=Object(c.c)(a,"input-group");const u=Object(r.useMemo)((()=>({})),[]);return Object(o.jsx)(i.a.Provider,{value:u,children:Object(o.jsx)(m,{ref:t,...f,className:s()(d,a,n&&"".concat(a,"-").concat(n),l&&"has-validation")})})}));f.displayName="InputGroup";t.a=Object.assign(f,{Text:m,Radio:e=>Object(o.jsx)(m,{children:Object(o.jsx)(l.a,{type:"radio",...e})}),Checkbox:e=>Object(o.jsx)(m,{children:Object(o.jsx)(l.a,{type:"checkbox",...e})})})},341:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=(a(100),a(44)),l=a(125),i=a(6),o=a(12),d=a(82),m=a(18),f=a(1);const u=r.forwardRef(((e,t)=>{let{bsPrefix:a,active:n,disabled:r,eventKey:c,className:l,variant:u,action:j,as:h,...b}=e;a=Object(i.c)(a,"list-group-item");const[p,x]=Object(d.b)({key:Object(m.b)(c,b.href),active:n,...b}),k=Object(o.a)((e=>{if(r)return e.preventDefault(),void e.stopPropagation();p.onClick(e)}));r&&void 0===b.tabIndex&&(b.tabIndex=-1,b["aria-disabled"]=!0);const g=h||(j?b.href?"a":"button":"div");return Object(f.jsx)(g,{ref:t,...b,...p,onClick:k,className:s()(l,a,x.isActive&&"active",r&&"disabled",u&&"".concat(a,"-").concat(u),j&&"".concat(a,"-action"))})}));u.displayName="ListGroupItem";var j=u;const h=r.forwardRef(((e,t)=>{const{className:a,bsPrefix:n,variant:r,horizontal:o,numbered:d,as:m="div",...u}=Object(c.a)(e,{activeKey:"onSelect"}),j=Object(i.c)(n,"list-group");let h;return o&&(h=!0===o?"horizontal":"horizontal-".concat(o)),Object(f.jsx)(l.a,{ref:t,...u,as:m,className:s()(a,j,r&&"".concat(j,"-").concat(r),h&&"".concat(j,"-").concat(h),d&&"".concat(j,"-numbered"))})}));h.displayName="ListGroup";t.a=Object.assign(h,{Item:j})},350:function(e,t,a){"use strict";t.a=a.p+"static/media/newDietImage.de2141ac.svg"},355:function(e,t,a){"use strict";var n=a(5),s=a.n(n),r=a(0),c=a(6),l=a(1);const i=r.forwardRef(((e,t)=>{let{bsPrefix:a,bg:n="primary",pill:r=!1,text:i,className:o,as:d="span",...m}=e;const f=Object(c.c)(a,"badge");return Object(l.jsx)(d,{ref:t,...m,className:s()(o,f,r&&"rounded-pill",i&&"text-".concat(i),n&&"bg-".concat(n))})}));i.displayName="Badge",t.a=i},512:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return ue}));var n,s,r,c,l,i,o,d,m,f,u,j,h,b,p,x,k,g,O,y,v,E,N,L,w,R,H,P,S,I,z,W,C,F,U,T,D,B,M=a(0),V=a(309),A=a(187),G=a(325),_=a(341),q=a(79),J=a(335),K=a(310),X=a(7),Y=a(14),Q=a(29),Z=a(37),$=a(303),ee=a(80),te=a(321),ae=a(355);function ne(){return ne=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},ne.apply(this,arguments)}function se(e,t){let{title:a,titleId:V,...A}=e;return M.createElement("svg",ne({xmlnsXlink:"http://www.w3.org/1999/xlink",clipRule:"evenodd",strokeLinecap:"round",strokeLinejoin:"round",strokeMiterlimit:10,viewBox:"0 0 500 400",xmlSpace:"preserve",xmlns:"http://www.w3.org/2000/svg",ref:t,"aria-labelledby":V},A),a?M.createElement("title",{id:V},a):null,n||(n=M.createElement("defs",null,M.createElement("path",{id:"l",d:"m94.25 38.873 0.6165-0.295c4.9975-2.3909 12.203 0.6795 16.095 6.8578l114.92 182.46c3.891 6.178 2.994 13.125-2.004 15.516l-0.616 0.295c-4.998 2.391-12.203-0.68-16.094-6.858l-114.92-182.46c-3.891-6.1783-2.9941-13.125 2.0034-15.516z"}),M.createElement("path",{id:"h",d:"m194.86 273.06c32.811-9.346 58.764-41.306 59.655-61.023 0.89-19.717-23.924-16.769-23.924-16.769s11.5-26.575-4.058-35.648c-15.559-9.074-29.105 7.105-29.105 7.105s-11.857-43.679-43.639-33.389c-31.783 10.29-14.018 50.923-14.018 50.923s-17.487-6.499-26.286 12.385 16.92 32.956 16.92 32.956l-11.02 16.318s42.664 36.488 75.475 27.142z"}),M.createElement("path",{id:"g",d:"m266.78 230.08c28.705-18.437 44.305-56.538 39.455-75.669-4.85-19.132-27.752-9.133-27.752-9.133s3.323-28.766-14.195-32.951-25.806 15.22-25.806 15.22-23.983-38.383-51.431-19.34c-27.448 19.042 1.311 52.801 1.311 52.801s-18.62-1.163-21.581 19.459 25.728 26.653 25.728 26.653l-5.828 18.808s51.393 22.588 80.099 4.152z"}),M.createElement("path",{id:"f",d:"m296.2 224.46c-25.466-22.703-34.909-62.776-27.123-80.913 7.785-18.137 28.839-4.676 28.839-4.676s1.221-28.931 19.179-30.322c17.957-1.392 23.104 19.071 23.104 19.071s29.697-34.154 53.825-11.05c24.129 23.105-9.56 51.945-9.56 51.945s18.572 1.766 18.269 22.598c-0.304 20.831-29.584 22.297-29.584 22.297l2.813 19.488s-54.297 14.265-79.762-8.438z"}),M.createElement("path",{id:"e",d:"m344.94 237.05-49.542-95.903c-2.627 0.733-5.192 1.672-7.665 2.776-15.625 6.976-27.813 21.038-31.57 39.069-6.213 29.819 12.927 59.035 42.745 65.248 14.024 2.922 27.871 0.174 39.296-6.592 2.342-1.387 4.621-2.881 6.736-4.598z"}),M.createElement("path",{id:"d",d:"m159.22 201.6s-1.956-13.91 7.746-30.435 13.504-13.937 24.944-2.597l55.628 55.14c11.441 11.34 7.742 20.326-8.261 20.069l-43.602-0.698c-8.147-0.13-19.432-6.304-26.477-15.816-6.792-9.17-10.184-20.13-9.978-25.663z"}),M.createElement("path",{id:"c",d:"m195.57 172.18c-7.512 5.284-12.437 14.127-12.437 24.188 0 16.2 12.764 29.344 28.531 29.344 10.152 0 19.032-5.486 24.094-13.688l-40.188-39.844z"}),M.createElement("path",{id:"b",d:"m115.02 219.43s-4.102 42.857 17.725 77.597c21.828 34.74 70.771 62.471 70.771 62.471l103.52 0.444s45.121-24.604 66.949-59.732 20.363-80.78 20.363-80.78h-279.33z"}),M.createElement("path",{id:"a",d:"m234.96 4.9377-83.781 68.063c1.253 2.4221 2.696 4.7415 4.281 6.9375 10.016 13.873 26.269 22.937 44.688 22.937 30.458 0 55.156-24.698 55.156-55.156 0-14.325-5.514-27.32-14.469-37.125-1.835-2.0097-3.763-3.9361-5.875-5.6562z"}),M.createElement("path",{id:"k",d:"m68.817 246.05c-30.342 0-54.938 31.997-54.938 71.469s24.595 71.469 54.938 71.469c10.934 0 21.097-4.213 29.656-11.375 8.5627 7.169 18.717 11.375 29.657 11.375 30.342 0 54.968-31.997 54.968-71.469s-24.626-71.469-54.968-71.469c-10.945 0-21.092 4.2-29.657 11.375-8.5618-7.167-18.718-11.375-29.656-11.375z"}),M.createElement("path",{id:"j",d:"m105.28 235.82c-7.4854-2.824-6.815-12.603 1.498-21.843 8.312-9.24 21.12-14.442 28.605-11.618 7.486 2.824 6.816 12.604-1.497 21.844s-21.12 14.441-28.606 11.617z"}),M.createElement("path",{id:"i",d:"m464.25 148.15c-7.101 0.963-16.095 11.057-21.405 24.658-1.126 2.882-1.933 5.691-2.573 8.414-15.085 9.613-32.009 38.57-42.635 75.698-4.275 14.94-6.874 29.331-8.187 42.567-15.606 6.705-31.117 17.854-41.816 31.436-0.606 0.77-0.989 1.515-1.55 2.279-18.352-1.768-38.739-1.14-56.494 2.396-34.141 6.8-45.48 21.581-25.324 33.014 17.777 10.083 54.102 14.176 85.854 10.342 1.51 0.445 3.087 0.817 4.825 1.052 18.029 2.443 42.754-7.559 61.729-23.577 15.301-9.027 32.678-38.343 43.511-76.195 10.742-37.534 11.973-72.647 4.503-90.394 1.777-2.958 3.447-6.229 4.825-9.758 6.069-15.543 4.996-29.773-2.368-31.786-0.921-0.252-1.881-0.284-2.895-0.146z"}))),s||(s=M.createElement("g",{opacity:.97479},M.createElement("use",{fill:"#adadad",xlinkHref:"#l"}),M.createElement("mask",{id:"x",x:89.8265,y:37.7668,width:138.469,height:206.757,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:89.826,y:37.767,width:138.47,height:206.76}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#l"})),M.createElement("use",{fill:"none",mask:"url(#x)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7902,xlinkHref:"#l"}))),r||(r=M.createElement("g",null,M.createElement("use",{fill:"#91d04b",xlinkHref:"#h"}),M.createElement("mask",{id:"t",x:111.655,y:131.768,width:142.887,height:142.825,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:111.66,y:131.77,width:142.89,height:142.82}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#h"})),M.createElement("use",{fill:"none",mask:"url(#t)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:14.89,xlinkHref:"#h"}))),c||(c=M.createElement("g",null,M.createElement("use",{fill:"#49a080",xlinkHref:"#g"}),M.createElement("mask",{id:"s",x:166.564,y:102.903,width:140.544,height:134.415,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:166.56,y:102.9,width:140.54,height:134.42}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#g"})),M.createElement("use",{fill:"none",mask:"url(#s)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:14.89,xlinkHref:"#g"}))),l||(l=M.createElement("g",null,M.createElement("use",{fill:"#93d979",xlinkHref:"#f"}),M.createElement("mask",{id:"r",x:266.425,y:108.478,width:136.312,height:128.84,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:266.42,y:108.48,width:136.31,height:128.84}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#f"})),M.createElement("use",{fill:"none",mask:"url(#r)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:14.89,xlinkHref:"#f"}))),i||(i=M.createElement("g",{opacity:.97479},M.createElement("use",{fill:"#fc6772",xlinkHref:"#e"}),M.createElement("mask",{id:"q",x:254.988,y:141.145,width:89.9477,height:108.252,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:254.99,y:141.14,width:89.948,height:108.25}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#e"})),M.createElement("use",{fill:"none",mask:"url(#q)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:16.765,xlinkHref:"#e"}))),o||(o=M.createElement("path",{d:"m286.66 185.11 9.766 2.151",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7})),d||(d=M.createElement("path",{d:"m301.71 205.23-8.613 5.082",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7})),m||(m=M.createElement("g",null,M.createElement("use",{fill:"#ffffff",xlinkHref:"#d"}),M.createElement("mask",{id:"p",x:159.061,y:159.412,width:95.1257,height:84.3658,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:159.06,y:159.41,width:95.126,height:84.366}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#d"})),M.createElement("use",{fill:"none",mask:"url(#p)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:14.88,xlinkHref:"#d"}))),f||(f=M.createElement("g",{opacity:.97479},M.createElement("path",{d:"m297.25 153.53c-5.713 1.614-11.081 4.102-15.656 7.938-2.39 2.003-4.504 4.313-6.282 6.875-11.005 15.86-7.487 38.25 4.657 52.406 7.71 8.988 18.707 14.426 30.437 15.688 5.931 0.637 11.857 0.227 17.719-0.782-5.862 0.828-11.774 1.062-17.656 0.25-11.422-1.577-21.999-7.155-29.25-16.187-11.224-13.981-13.805-35.606-2.281-50.219 1.74-2.207 3.783-4.187 6.031-5.875 3.99-2.997 8.55-4.926 13.343-6.219 1.065-0.294 1.67-1.404 1.376-2.468-0.295-1.065-1.373-1.701-2.438-1.407z"}))),u||(u=M.createElement("g",null,M.createElement("use",{fill:"#fddf19",xlinkHref:"#c"}),M.createElement("mask",{id:"o",x:183.129,y:172.175,width:52.625,height:53.5312,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:183.13,y:172.18,width:52.625,height:53.531}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#c"})),M.createElement("use",{fill:"none",mask:"url(#o)",stroke:"#000000",strokeLinecap:"butt",strokeLinejoin:"round",strokeWidth:14.89,xlinkHref:"#c"}))),j||(j=M.createElement("g",null,M.createElement("use",{fill:"#d5eaff",xlinkHref:"#b"}),M.createElement("mask",{id:"n",x:114.716,y:219.426,width:279.653,height:140.511,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:114.72,y:219.43,width:279.65,height:140.51}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#b"})),M.createElement("use",{fill:"none",mask:"url(#n)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:21.726,xlinkHref:"#b"}))),h||(h=M.createElement("path",{d:"m124.15 258.95h188.87",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10.863})),b||(b=M.createElement("path",{d:"m335.25 258.95h49.211",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10.863})),p||(p=M.createElement("g",{opacity:.97479},M.createElement("use",{fill:"#fc6772",xlinkHref:"#a"}),M.createElement("mask",{id:"m",x:151.18,y:4.93767,width:104.125,height:97.9375,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:151.18,y:4.9377,width:104.12,height:97.938}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#a"})),M.createElement("use",{fill:"none",mask:"url(#m)",stroke:"#000000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:16.765,xlinkHref:"#a"}))),x||(x=M.createElement("path",{d:"m194.66 68.736 0.14 10",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7})),k||(k=M.createElement("path",{d:"m211.32 61.863 7.266 6.8723",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7})),g||(g=M.createElement("path",{d:"m218.58 45.427 10 0.0976",fill:"none",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:8.7})),O||(O=M.createElement("path",{d:"m359.86 147.63s-8.633 7.944-16.247 18.163c-7.614 10.22-14.21 24.149-14.21 24.149",fill:"none",opacity:.97479,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:4.3951})),y||(y=M.createElement("path",{d:"m365.9 211.77s-16.352-16.024-29.126-24.111c-12.773-8.087-29.131-8.237-29.131-8.237",fill:"none",opacity:0,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:4.3951})),v||(v=M.createElement("path",{d:"m231.3 168.94s5.466 11.109 8.924 23.68c3.458 12.57 4.301 27.841 4.301 27.841",fill:"none",opacity:.97479,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:4.3951})),E||(E=M.createElement("g",{opacity:.97479},M.createElement("path",{d:"m234.06 16.812c2.602 5.5374 4.646 11.267 5.688 17.312 2.004 11.632 0.012 23.746-6.438 33.719-9.382 14.508-27.871 23.545-44.906 18.125-2.684-0.8541-5.276-2.0548-7.656-3.5626-5.067-3.2106-8.967-7.6988-12.125-12.75-0.591-0.9329-1.848-1.216-2.781-0.625-0.933 0.5911-1.185 1.8171-0.594 2.75 3.536 5.5121 7.906 10.374 13.531 13.813 2.678 1.6371 5.576 2.9163 8.594 3.7812 17.853 5.1161 36.843-4.3528 46.594-19.469 6.838-10.6 8.806-23.587 6.312-35.875-1.225-6.0385-3.442-11.736-6.219-17.219z"}))),N||(N=M.createElement("g",null,M.createElement("use",{fill:"#ec0014",xlinkHref:"#k"}),M.createElement("mask",{id:"w",x:13.8796,y:246.054,width:169.219,height:142.937,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:13.88,y:246.05,width:169.22,height:142.94}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#k"})),M.createElement("use",{fill:"none",mask:"url(#w)",stroke:"#000000",strokeLinecap:"butt",strokeLinejoin:"round",strokeWidth:20,xlinkHref:"#k"}))),L||(L=M.createElement("path",{d:"m62.558 273.45s-9.3153 3.31-14.732 10.692c-5.4165 7.382-6.934 18.835-6.934 18.835",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),w||(w=M.createElement("path",{d:"m76.823 223.81s9.3154 3.311 14.732 10.693 6.934 18.835 6.934 18.835",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),R||(R=M.createElement("g",{opacity:.97816},M.createElement("use",{fill:"#6fd907",xlinkHref:"#j"}),M.createElement("mask",{id:"v",x:100.075,y:201.595,width:40.5101,height:34.9981,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:100.08,y:201.6,width:40.51,height:34.998}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#j"})),M.createElement("use",{fill:"none",mask:"url(#v)",stroke:"#6fd907",strokeLinecap:"butt",strokeLinejoin:"round",strokeWidth:20,xlinkHref:"#j"}))),H||(H=M.createElement("path",{d:"m143.29 199.61s-16.438 1.776-27.918 10.212c-11.479 8.435-18 23.529-18 23.529",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),P||(P=M.createElement("path",{d:"m98.792 238.57s16.054-2.052 27.266-11.792c11.212-9.74 17.581-27.168 17.581-27.168",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),S||(S=M.createElement("g",null,M.createElement("use",{fill:"#fddf19",xlinkHref:"#i"}),M.createElement("mask",{id:"u",x:254.285,y:148.073,width:219.163,height:232.305,maskUnits:"userSpaceOnUse"},M.createElement("rect",{x:254.28,y:148.07,width:219.16,height:232.3}),M.createElement("use",{fill:"#ffffff",fillRule:"evenodd",xlinkHref:"#i"})),M.createElement("use",{fill:"none",mask:"url(#u)",stroke:"#fddf19",strokeLinecap:"butt",strokeLinejoin:"round",strokeWidth:20,xlinkHref:"#i"}))),I||(I=M.createElement("path",{d:"m454.85 148.07-14.583 33.153",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),z||(z=M.createElement("path",{d:"m455.86 148.08 23.449 7.086",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),W||(W=M.createElement("path",{d:"m479.31 155.16-11.724 29.952",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),C||(C=M.createElement("path",{d:"m467.58 185.11s10.613 111.42-38.673 162.97c-23.901 24.996-78.055 40.511-112.95 34.516-37.064-6.366-66.009-21.103-66.009-21.103",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),F||(F=M.createElement("path",{d:"m249.75 361.97 10.468-19.951",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),U||(U=M.createElement("path",{d:"m260.63 342.51 15.21-0.81",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),T||(T=M.createElement("path",{d:"m276.96 341.15-5.03 17.881",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),D||(D=M.createElement("path",{d:"m276.96 341.15s10.035-8.754 22.185-8.941c15.344-0.235 35.281 6.923 56.198-7.188 16.447-11.096 29.371-24.645 37.469-40.525 5.287-10.37 6.943-18.298 9.93-29.283 1.523-5.601 1.853-11.638 4.359-18.447s2.943-9.135 6.981-18.682c4.038-9.548 6.262-15.148 9.827-19.508 6.438-7.875 13.618-13.57 16.363-17.354 2.744-3.785 14.583 3.888 14.583 3.888",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})),B||(B=M.createElement("path",{d:"m448.93 198.58s-4.963 8.259-7.914 16.189m-4.367 37.362c-3.96 23.365-13.771 50.34-34.183 69.052-19.096 17.506-48.338 34.617-76.221 30.419-29.614-4.458-28.842-3.597-28.842-3.597",fill:"none",opacity:.97816,stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:10})))}const re=M.forwardRef(se);a.p;var ce=a(1);var le=e=>{let{diary:t}=e;const a=t.timestamp.toDate().toLocaleDateString("it-IT");return Object(ce.jsx)(_.a.Item,{className:"col-12",style:{padding:0},children:Object(ce.jsx)(Y.a,{className:"d-flex flex-column mx-auto my-auto ",children:Object(ce.jsx)(Y.a,{className:"d-flex flex-wrap text-start",style:{padding:0},children:Object(ce.jsxs)(Y.a,{className:"d-flex flex-row justify-content-evenly my-auto gap-1",style:{padding:0,marginTop:20},children:[Object(ce.jsx)(Y.a,{style:{margin:0},className:"col-6 col-sm-2 mx-auto my-auto text-center",children:Object(ce.jsx)(re,{style:{maxHeight:50,margin:10}})}),Object(ce.jsxs)(Y.a,{className:"d-flex flex-wrap align-items-center col-7 col-sm-9",style:{padding:0},children:[Object(ce.jsx)(Y.a,{style:{padding:0},className:"col-12 col-sm-3 mb-2 mb-sm-0 mt-2 mt-lg-0",children:Object(ce.jsxs)("div",{className:"float-start",style:{margin:0},children:["Data: ",Object(ce.jsx)("strong",{children:a})]})}),Object(ce.jsx)(Y.a,{style:{padding:0,margin:0},className:"col-12 col-sm-3 my-auto",children:Object(ce.jsxs)("div",{style:{margin:0},children:["Sgarrato: ",Object(ce.jsx)("strong",{children:t.sgarrato?Object(ce.jsx)("div",{className:"d-inline-block",children:Object(ce.jsx)(ae.a,{pill:!0,bg:"danger",style:{marginLeft:5},children:Object(ce.jsx)("p",{style:{margin:1},children:"Si"})})}):Object(ce.jsx)("div",{className:"d-inline-block",children:Object(ce.jsx)(ae.a,{pill:!0,bg:"success",style:{marginLeft:5},children:Object(ce.jsx)("p",{style:{margin:1},children:"No"})})})})]})}),Object(ce.jsx)(Y.a,{style:{padding:0},className:"col-12 col-sm-3 mb-2 mb-sm-3 mb-lg-0",children:Object(ce.jsxs)("div",{style:{margin:0},children:["Pasto: ",Object(ce.jsx)("strong",{children:t.categoria_pasto})]})}),Object(ce.jsx)(Y.a,{style:{padding:0},className:"col-12 col-md-10",children:Object(ce.jsxs)("div",{style:{margin:0},children:["Descrizione: ",Object(ce.jsx)("strong",{children:t.descrizione})]})})]})]})})})})},ie=a(54),oe=a(13),de=a(20),me=a(19),fe=a(350);function ue(){const{id:e}=Object(X.I)(),[t,a]=Object(M.useState)(""),[n,s]=Object(M.useState)(""),[r,c]=Object(M.useState)(),[l,i]=Object(M.useState)(!0),[o,d]=Object(M.useState)(1),[m,f]=Object(M.useState)(""),u=7*o,j=u-7,[h,b]=Object(M.useState)([]),p=Object(X.D)();Object(M.useEffect)((()=>{Object(ie.a)();(async()=>{i(!0);const t=Object(Q.d)(Z.b,"diets",e);await Object(Q.e)(t).then((async t=>{t.exists()?await Object(Q.f)(Object(Q.i)(Object(Q.b)(Z.b,"diets",e,"diarioAlimentare"),Object(Q.h)("timestamp","desc"))).then((e=>{e.empty?s("Non \xe8 stato ancora utilizzato il bot di telegram 'YourFoodCoachBot' per registrare il diario alimentare"):(b(e.docs.map((e=>({...e.data(),id:e.id})))),d(1))})).catch((e=>a("Si \xe8 verificato un errore inaspettato"))):p("/progressi-pazienti",{replace:!0})})).finally((()=>i(!1)))})()}),[]),Object(M.useEffect)((()=>{(async()=>{i(!0);const t=Object(Q.d)(Z.b,"diets",e);await Object(Q.e)(t).then((e=>{e.exists()&&(c(e.data()),i(!1))}))})()}),[]);const x=h.filter((e=>""===m.toLowerCase()?e:e.timestamp.toDate().toLocaleDateString("it-IT").includes(m.toLowerCase())));return!0===l?Object(ce.jsx)(ee.a,{}):Object(ce.jsx)(ce.Fragment,{children:!1===l&&Object(ce.jsx)(Y.a,{className:"modal-fullscreen",style:{background:"linear-gradient(123deg, rgba(247,209,98,1) 30%, rgba(251,149,96,1) 50%, rgba(254,88,94,1) 70%)",backgroundSize:"cover",minHeight:"inherit",padding:0},children:Object(ce.jsx)(Y.a,{className:"modal-fullscreen text-center",children:Object(ce.jsx)(Y.a,{className:"d-flex flex-column mx-auto my-auto",style:{minHeight:450,marginTop:20},children:Object(ce.jsxs)(V.a,{className:"col-12 col-sm-12 col-md-10 mx-auto",style:{marginTop:20,marginBottom:20,borderRadius:16,boxShadow:"10px 10px 10px rgba(30,30,30,0.5)",borderLeft:"solid 1px rgba(255,255,255,0.8)",borderTop:"solid 1px rgba(255,255,255,0.8)"},children:[Object(ce.jsxs)("h2",{style:{fontFamily:"Arial",marginTop:10},children:[Object(ce.jsx)("div",{className:"d-flex my-auto col-12",children:Object(ce.jsx)("div",{className:"col-12",children:Object(ce.jsx)("div",{className:"float-start",style:{marginTop:10,marginLeft:20},children:Object(ce.jsx)(oe.LinkContainer,{to:"/progressi-paziente/".concat(e),className:"my-auto",children:Object(ce.jsx)(A.a,{style:{height:40,width:100},variant:"warning",children:Object(ce.jsx)(de.a,{icon:me.a,color:"black"})})})})})}),Object(ce.jsxs)("div",{className:"d-flex d-inline-block col-12 justify-content-center",children:[Object(ce.jsx)("img",{src:fe.a,style:{height:90,width:90,marginRight:10},alt:"Nuova dieta"}),Object(ce.jsxs)("h5",{className:"my-auto",children:["Diario Alimentare: ",Object(ce.jsx)("p",{children:Object(ce.jsxs)("strong",{children:[r.cognome_paziente," ",r.nome_paziente]})})]})]})]}),Object(ce.jsx)($.a,{color:"#eb6164",loading:l,style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:1}}),Object(ce.jsx)(G.a,{className:"d-flex flex-column",children:Object(ce.jsxs)(Y.a,{className:"d-flex flex-wrap justify-content-evenly",style:{marginBottom:20,marginTop:10,minHeight:500},children:[Object(ce.jsxs)(_.a,{className:"col-12 mx-auto",style:{marginBottom:20},children:[Object(ce.jsx)(q.a,{expand:"lg",className:"justify-content-end",style:{marginBottom:10},children:Object(ce.jsx)(Y.a,{className:"col-6 col-sm-6 col-lg-5",style:{margin:0,padding:0},children:Object(ce.jsx)(J.a,{className:"d-flex ",children:Object(ce.jsx)(G.a.Control,{type:"search",placeholder:"Cerca data...",className:"me-2","aria-label":"Search",value:m,onChange:e=>{d(1),f(e.target.value)}})})})}),x.slice(j,u).map((e=>Object(ce.jsx)(le,{diary:e},e.id))),n&&Object(ce.jsx)(K.a,{className:"mx-auto col-10 flex-wrap",variant:"warning",style:{margin:30},children:n}),0===x.length&&!t&&h.length>0?Object(ce.jsx)(K.a,{variant:"warning",style:{margin:30},children:"Nessun dato soddisfa i parametri di ricerca"}):Object(ce.jsx)(ce.Fragment,{})]}),Object(ce.jsx)(Y.a,{className:"d-flex flex-wrap justify-content-center mt-auto",children:0!==h.length&&Object(ce.jsx)(te.a,{itemsCount:x.length,itemsPerPage:7,currentPage:o,setCurrentPage:d,alwaysShown:!0})})]})})]})})})})})}}}]);
//# sourceMappingURL=10.ce5ad80c.chunk.js.map