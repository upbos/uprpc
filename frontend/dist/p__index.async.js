"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[866],{84849:function(yn,Me,a){a.r(Me),a.d(Me,{default:function(){return hn}});var Xe=a(42805),qe=a(15009),f=a.n(qe),_e=a(99289),Y=a.n(_e),et=a(64599),R=a.n(et),tt=a(5574),O=a.n(tt),I=a(67294),ue=a(71217),me=a(13448),Ce=a(16536),Oe=a(67040),_=a(97183),Ee=a(71230),ee=a(15746),ge=a(26713),Q=a(84908),pe=a(34895),je=a(62986),nt=a(37877),rt=a(26911),it=a(69015),st=a(13520),Se=a(18429),We=a(64789),ot=a(33160),at=a(48689),lt=a(32319),ut=a(26024),dt=a(80882),ct=a(12444),te=a.n(ct),ht=a(72004),ne=a.n(ht),ft=a(9783),g=a.n(ft),Ie=a(68949),vt=a(97857),y=a.n(vt),Be="includeDirs",Ze="protos";function mt(e,n,t){var s=R()(e.methods),i;try{for(s.s();!(i=s.n()).done;){var o=i.value;if(n==o.serviceName&&o.name==t)return o}}catch(u){s.e(u)}finally{s.f()}return null}function De(e){for(var n=de(),t=0,s=n;t<s.length;t++){var i=s[t];if(i.path==e)return i}return null}function de(){var e=localStorage.getItem(Ze);return e==null?[]:JSON.parse(e)}function gt(e){var n=R()(e),t;try{for(n.s();!(t=n.n()).done;){var s=t.value;be(s)}}catch(i){n.e(i)}finally{n.f()}}function be(e){for(var n=de(),t=0;t<n.length;t++)if(n[t].path===e.path){n.splice(t,1);break}n.push(e),localStorage.setItem(Ze,JSON.stringify(n))}function pt(e){var n=R()(e),t;try{for(n.s();!(t=n.n()).done;){var s=t.value;St(s)}}catch(i){n.e(i)}finally{n.f()}}function St(e){var n=De(e.path);if(n!=null){var t=y()(y()({},e),{},{host:n.host}),s=R()(t.methods),i;try{for(s.s();!(i=s.n()).done;){var o=i.value,u=mt(n,o.serviceName,o.name);if(u!=null){o.id=u.id,o.requestMds=u.requestMds,o.responseMds=u.responseMds;var d=o.requestBody?JSON.parse(o.requestBody):{},h=u.requestBody?JSON.parse(u.requestBody):{};for(var v in d)h[v]!=null&&(d[v]=h[v]);o.requestBody=JSON.stringify(d,null,"	")}}}catch(B){s.e(B)}finally{s.f()}be(t)}}function yt(e){for(var n=de(),t=0;t<n.length;t++)if(n[t].path===e){n.splice(t,1);break}localStorage.setItem(Ze,JSON.stringify(n))}function wt(e){var n=De(e);return n==null?[]:n.methods}function J(){var e=localStorage.getItem(Be);return e==null?[]:JSON.parse(e)}function xt(e){for(var n=J(),t=0;t<n.length;t++)if(n[t]===e){n.splice(t,1);break}n.push(e),localStorage.setItem(Be,JSON.stringify(n))}function Ct(e){for(var n=J(),t=0;t<n.length;t++)if(n[t]===e){n.splice(t,1);break}localStorage.setItem(Be,JSON.stringify(n))}function Et(){return window.go.main.Api.OpenIncludeDir()}function jt(){return window.go.main.Api.OpenProto()}function Fe(e,n){return window.go.main.Api.ParseProto(e,n)}function It(e){return window.go.main.Api.Push(e)}function Bt(e){return window.go.main.Api.Send(e)}function Zt(e){return window.go.main.Api.Stop(e)}var Dt=function(){function e(){te()(this,e),g()(this,"includeDirDrawerVisible",!1),g()(this,"includeDirs",[]),console.log("init paths store"),(0,Ie.ky)(this),this.init()}return ne()(e,[{key:"init",value:f()().mark(function n(){return f()().wrap(function(s){for(;;)switch(s.prev=s.next){case 0:this.includeDirs=J();case 1:case"end":return s.stop()}},n,this)})},{key:"showIncludeDir",value:function(t){this.includeDirDrawerVisible=t}},{key:"addIncludeDir",value:f()().mark(function n(){var t;return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,Et();case 2:t=i.sent,t.success&&t.data!=""&&(xt(t.data),this.includeDirs=J());case 4:case"end":return i.stop()}},n,this)})},{key:"removeIncludeDir",value:f()().mark(function n(t){return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:Ct(t),this.includeDirs=J();case 2:case"end":return i.stop()}},n,this)})}]),e}(),bt=function(){function e(){te()(this,e),g()(this,"selectedTab","1"),g()(this,"openTabs",[]),console.log("init tab store"),(0,Ie.ky)(this)}return ne()(e,[{key:"selectTab",value:function(t){this.selectedTab=t}},{key:"setDot",value:function(t){var s=this,i=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;this.openTabs.forEach(function(o,u){o.key==t&&(o.dot=i,s.openTabs.splice(u,1,o))})}},{key:"openTab",value:function(t){this.openTabs.length==1&&this.openTabs[0].key==="1"&&this.openTabs.splice(0,1);var s=this.openTabs.findIndex(function(i){return i.key===t.key});s==-1&&this.openTabs.push(t),this.selectedTab=t.key}},{key:"remove",value:function(t){var s=this;this.openTabs.forEach(function(i,o){if(i.key==t){if(s.openTabs.splice(o,1),s.openTabs.length==0)return;var u=o<s.openTabs.length?o:s.openTabs.length-1;s.selectedTab=s.openTabs[u].key}})}}]),e}(),re,l;(function(e){e[e.Text=0]="Text",e[e.Int8=1]="Int8",e[e.Int16LE=2]="Int16LE",e[e.Int16BE=3]="Int16BE",e[e.Int32LE=4]="Int32LE",e[e.Int32BE=5]="Int32BE",e[e.FloatLE=6]="FloatLE",e[e.FloatBE=7]="FloatBE",e[e.DoubleLE=8]="DoubleLE",e[e.DoubleBE=9]="DoubleBE",e[e.Uint8=10]="Uint8",e[e.Uint16LE=11]="Uint16LE",e[e.Uint16BE=12]="Uint16BE",e[e.Uint32LE=13]="Uint32LE",e[e.Uint32BE=14]="Uint32BE",e[e.BigInt64BE=15]="BigInt64BE",e[e.BigInt64LE=16]="BigInt64LE",e[e.BigUint64BE=17]="BigUint64BE",e[e.BigUint64LE=18]="BigUint64LE"})(l||(l={}));var Ne=new Map([[l.Text,"Text"],[l.Int8,"Int8"],[l.Int16LE,"Int16LE"],[l.Int16BE,"Int16BE"],[l.Int32LE,"Int32LE"],[l.Int32BE,"Int32BE"],[l.FloatLE,"FloatLE"],[l.FloatBE,"FloatBE"],[l.DoubleLE,"DoubleLE"],[l.DoubleBE,"DoubleBE"],[l.Uint8,"UInt8"],[l.Uint16LE,"Uint16LE"],[l.Uint16BE,"Uint16BE"],[l.Uint32LE,"Uint32LE"],[l.Uint32BE,"Uint32BE"],[l.BigInt64BE,"BigInt64BE"],[l.BigInt64LE,"BigInt64LE"],[l.BigUint64BE,"BigUint64BE"],[l.BigUint64LE,"BigUint64LE"]]),W;(function(e){e[e.Unary=0]="Unary",e[e.ClientStream=1]="ClientStream",e[e.ServerStream=2]="ServerStream",e[e.BidirectionalStream=3]="BidirectionalStream"})(W||(W={}));var Lt=(re={},g()(re,W.Unary,"Unary Call"),g()(re,W.ClientStream,"Client Stream"),g()(re,W.ServerStream,"Server Stream"),g()(re,W.BidirectionalStream,"Bi-Directional"),re),ye;(function(e){e[e.Proto=0]="Proto",e[e.Env=1]="Env"})(ye||(ye={}));var kt=a(52677),Ut=a.n(kt),Re;(function(e){var n=function(){function t(){var s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};te()(this,t),g()(this,"success",void 0),g()(this,"message",void 0),g()(this,"data",void 0),typeof s=="string"&&(s=JSON.parse(s)),this.success=s.success,this.message=s.message,this.data=s.data}return ne()(t,null,[{key:"createFrom",value:function(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return new t(i)}}]),t}();e.R=n})(Re||(Re={}));var we;(function(e){var n=function(){function s(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};te()(this,s),g()(this,"id",void 0),g()(this,"key",void 0),g()(this,"value",void 0),g()(this,"parseType",void 0),typeof i=="string"&&(i=JSON.parse(i)),this.id=i.id,this.key=i.key,this.value=i.value,this.parseType=i.parseType}return ne()(s,null,[{key:"createFrom",value:function(){var o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return new s(o)}}]),s}();e.Metadata=n;var t=function(){function s(){var i=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};te()(this,s),g()(this,"id",void 0),g()(this,"protoPath",void 0),g()(this,"serviceName",void 0),g()(this,"serviceFullyName",void 0),g()(this,"methodName",void 0),g()(this,"methodMode",void 0),g()(this,"host",void 0),g()(this,"body",void 0),g()(this,"mds",void 0),g()(this,"includeDirs",void 0),typeof i=="string"&&(i=JSON.parse(i)),this.id=i.id,this.protoPath=i.protoPath,this.serviceName=i.serviceName,this.serviceFullyName=i.serviceFullyName,this.methodName=i.methodName,this.methodMode=i.methodMode,this.host=i.host,this.body=i.body,this.mds=this.convertValues(i.mds,n),this.includeDirs=i.includeDirs}return ne()(s,[{key:"convertValues",value:function(o,u){var d=this,h=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1;if(!o)return o;if(o.slice)return o.map(function(E){return d.convertValues(E,u)});if(Ut()(o)==="object"){if(h){for(var v=0,B=Object.keys(o);v<B.length;v++){var C=B[v];o[C]=new u(o[C])}return o}return new u(o)}return o}}],[{key:"createFrom",value:function(){var o=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return new s(o)}}]),s}();e.RequestData=t})(we||(we={}));function wn(e){window.runtime.LogPrint(e)}function xn(e){window.runtime.LogTrace(e)}function Cn(e){window.runtime.LogDebug(e)}function En(e){window.runtime.LogInfo(e)}function jn(e){window.runtime.LogWarning(e)}function In(e){window.runtime.LogError(e)}function Bn(e){window.runtime.LogFatal(e)}function Te(e,n,t){window.runtime.EventsOnMultiple(e,n,t)}function Le(e,n){Te(e,n,-1)}function Zn(e){for(var n,t=arguments.length,s=new Array(t>1?t-1:0),i=1;i<t;i++)s[i-1]=arguments[i];return(n=window.runtime).EventsOff.apply(n,[e].concat(s))}function Dn(e,n){Te(e,n,1)}function bn(e){var n=[e].slice.call(arguments);return window.runtime.EventsEmit.apply(null,n)}function Ln(){window.runtime.WindowReload()}function kn(){window.runtime.WindowReloadApp()}function Un(){window.runtime.WindowSetSystemDefaultTheme()}function Pn(){window.runtime.WindowSetLightTheme()}function Mn(){window.runtime.WindowSetDarkTheme()}function On(){window.runtime.WindowCenter()}function Wn(e){window.runtime.WindowSetTitle(e)}function Fn(){window.runtime.WindowFullscreen()}function Nn(){window.runtime.WindowUnfullscreen()}function Rn(){return window.runtime.WindowIsFullscreen()}function Tn(){return window.runtime.WindowGetSize()}function An(e,n){window.runtime.WindowSetSize(e,n)}function zn(e,n){window.runtime.WindowSetMaxSize(e,n)}function Vn(e,n){window.runtime.WindowSetMinSize(e,n)}function $n(e,n){window.runtime.WindowSetPosition(e,n)}function Hn(){return window.runtime.WindowGetPosition()}function Kn(){window.runtime.WindowHide()}function Jn(){window.runtime.WindowShow()}function Gn(){window.runtime.WindowMaximise()}function Yn(){window.runtime.WindowToggleMaximise()}function Qn(){window.runtime.WindowUnmaximise()}function Xn(){return window.runtime.WindowIsMaximised()}function qn(){window.runtime.WindowMinimise()}function _n(){window.runtime.WindowUnminimise()}function er(e,n,t,s){window.runtime.WindowSetBackgroundColour(e,n,t,s)}function tr(){return window.runtime.ScreenGetAll()}function nr(){return window.runtime.WindowIsMinimised()}function rr(){return window.runtime.WindowIsNormal()}function ir(e){window.runtime.BrowserOpenURL(e)}function sr(){return window.runtime.Environment()}function or(){window.runtime.Quit()}function ar(){window.runtime.Hide()}function lr(){window.runtime.Show()}var Pt=function(){function e(){te()(this,e),g()(this,"protos",[]),g()(this,"requestCaches",new Map),g()(this,"responseCaches",new Map),g()(this,"runningCaches",new Map),console.log("init rpc store"),(0,Ie.ky)(this),this.init()}return ne()(e,[{key:"init",value:function(){this.initProto(),this.onEndStream(),this.onResponse()}},{key:"initProto",value:function(){this.protos=de()}},{key:"onEndStream",value:function(){var t=this;Le("end",function(s){console.log("end data: ",s),t.runningCaches.set(s,!1)})}},{key:"onResponse",value:function(){var t=this;Le("data",function(s){console.log("Response data: ",s);var i=t.responseCaches.get(s.id);if(i==null){t.responseCaches.set(s.id,{body:s.body,mds:s.mds,streams:[s.body]});return}var o=i.streams;o!=null&&(o.unshift(s.body),t.responseCaches.set(s.id,y()(y()({},i),{},{streams:o,mds:s.mds})))})}},{key:"importProto",value:f()().mark(function n(){var t;return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,jt();case 2:if(t=i.sent,!(!t.success||t.data==null||t.data.length==0)){i.next=5;break}return i.abrupt("return",{success:!0});case 5:return i.next=7,Fe(t.data,J());case 7:if(t=i.sent,t.success){i.next=10;break}return i.abrupt("return",t);case 10:return gt(t.data),this.initProto(),i.abrupt("return",{success:!0});case 13:case"end":return i.stop()}},n,this)})},{key:"reloadProto",value:f()().mark(function n(){var t,s;return f()().wrap(function(o){for(;;)switch(o.prev=o.next){case 0:return t=[],de().forEach(function(u){return t.push(u.path)}),console.log("reload proto req:",t),o.next=5,Fe(t,J());case 5:if(s=o.sent,console.log("reload proto :",s),s.success){o.next=9;break}return o.abrupt("return",s);case 9:pt(s.data),this.initProto();case 11:case"end":return o.stop()}},n,this)})},{key:"deleteProto",value:f()().mark(function n(t){return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:yt(t),this.initProto();case 2:case"end":return i.stop()}},n,this)})},{key:"saveProto",value:f()().mark(function n(t,s,i){var o,u,d;return f()().wrap(function(v){for(;;)switch(v.prev=v.next){case 0:if(console.log("save proto method",i),o=De(t.path),o!=null){v.next=4;break}return v.abrupt("return");case 4:for(o.host=s,u=0;u<o.methods.length;u++)d=o.methods[u],d.id==i.id&&(o.methods[u]=i);be(o),this.initProto(),Ce.ZP.success("Save configuration successfully.");case 9:case"end":return v.stop()}},n,this)})},{key:"send",value:f()().mark(function n(t){return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return this.removeCache(t.id),t.methodMode!=W.Unary&&this.runningCaches.set(t.id,!0),i.next=4,this.push(t,!1);case 4:case"end":return i.stop()}},n,this)})},{key:"push",value:f()().mark(function n(t,s){var i,o;return f()().wrap(function(d){for(;;)switch(d.prev=d.next){case 0:if(i=this.requestCaches.get(t.id),i==null?this.requestCaches.set(t.id,{streams:[t.body]}):(o=i.streams,o==null||o.unshift(t.body),this.requestCaches.set(t.id,{streams:o})),t.includeDirs=J(),!s){d.next=8;break}return d.next=6,It(new we.RequestData(t));case 6:d.next=11;break;case 8:return console.log("send request data",t),d.next=11,Bt(new we.RequestData(t));case 11:case"end":return d.stop()}},n,this)})},{key:"removeCache",value:f()().mark(function n(t){return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:this.requestCaches.delete(t),this.responseCaches.delete(t),this.runningCaches.delete(t);case 3:case"end":return i.stop()}},n,this)})},{key:"stopStream",value:f()().mark(function n(t){return f()().wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return console.log("request stop stream"),i.next=3,Zt(t);case 3:this.runningCaches.set(t,!1);case 4:case"end":return i.stop()}},n,this)})}]),e}(),Ae=new Dt,ze=new bt,Ve=new Pt,ie=(0,I.createContext)({includeDirStore:Ae,tabStore:ze,protoStore:Ve}),Mt=a(63463),T=a(71577),$e=a(95507),ur=a(70133),He=a(24969),Ot=a(97937),r=a(85893),Wt=function(){var n=(0,I.useContext)(ie),t=n.includeDirStore;return(0,r.jsx)(Mt.Z,{title:"Import Paths",placement:"left",width:500,open:t.includeDirDrawerVisible,onClose:function(){return t.showIncludeDir(!1)},style:{padding:5},bodyStyle:{padding:5},extra:(0,r.jsx)(T.Z,{type:"link",icon:(0,r.jsx)(He.Z,{}),onClick:function(){return t.addIncludeDir()},children:"Add Path"}),children:(0,r.jsx)($e.ZP,{size:"large",loadMore:(0,r.jsx)("div",{}),dataSource:t.includeDirs,renderItem:function(i){return(0,r.jsx)($e.ZP.Item,{actions:[(0,r.jsx)("a",{onClick:function(){return t.removeIncludeDir(i)},children:(0,r.jsx)(Ot.Z,{})})],children:i})}})})},Ft=(0,ue.Pi)(Wt),A={header:"header___tHXcr",requestStreamHeight:"requestStreamHeight___LV6s3",metadataColumn:"metadataColumn___o3Lum",operatorBtn:"operatorBtn___dpSJd"},Nt=function(){var n=(0,I.useContext)(ie),t=n.tabStore,s=n.protoStore,i=n.includeDirStore,o=(0,I.useState)(!1),u=O()(o,2),d=u[0],h=u[1],v=(0,I.useState)([]),B=O()(v,2),C=B[0],E=B[1],c=(0,I.useState)(""),Z=O()(c,2),b=Z[0],oe=Z[1],fe=(0,I.useState)(!0),G=O()(fe,2),ae=G[0],X=G[1],ve=(0,I.useState)(),F=O()(ve,2),D=F[0],P=F[1],$=function(p){h(p),p||oe("")},L=function(p){E(p),X(!1)},m=function(p){var S=new Set,x=R()(s.protos),j;try{for(x.s();!(j=x.n()).done;){var z=j.value;z.name.toLowerCase().indexOf(p.toLowerCase())>-1&&S.add(z.path);var M=R()(z.methods),V;try{for(M.s();!(V=M.n()).done;){var k=V.value;k.serviceName.toLowerCase().indexOf(p.toLowerCase())>-1&&S.add(z.path+k.serviceName),k.name.toLowerCase().indexOf(p.toLowerCase())>-1&&S.add(k.id)}}catch(N){M.e(N)}finally{M.f()}}}catch(N){x.e(N)}finally{x.f()}return Array.from(S)},H=function(p){var S=p.target.value,x=m(S);E(x),oe(S),X(!0)},w=function(p,S){var x=p.toLowerCase().indexOf(b.toLowerCase()),j=p.substring(0,x),z=p.substring(x,x+b.length),M=p.slice(x+b.length),V=x>-1?(0,r.jsxs)("span",{children:[j,(0,r.jsx)("span",{style:{color:"#f50"},children:z}),M]}):(0,r.jsx)("span",{children:p});return V},fn=function(p){var S=[],x=R()(p),j;try{var z=function(){var k=j.value,N={id:k.path,isProto:!0,name:k.name,title:(0,r.jsx)("span",{style:{width:"100%"},children:w(k.name,b)}),icon:(0,r.jsx)(rt.Z,{}),children:[]};if(!k.methods)return"continue";var le=new Map;k.methods.forEach(function(K,q,Sn){var xe=le.get(K.serviceName);xe==null&&(xe=[]),xe.push({proto:{path:k.path,host:k.host},method:K,title:w(K.name,b),icon:(0,r.jsx)(it.Z,{})}),le.set(K.serviceName,xe)}),le.forEach(function(K,q,Sn){N.children.push({id:k.path+q,title:w(q,b),icon:(0,r.jsx)(st.Z,{}),children:K})}),S.push(N)};for(x.s();!(j=x.n()).done;)var M=z()}catch(V){x.e(V)}finally{x.f()}return S},vn=function(p,S){P(void 0),S.node.isProto&&P({id:S.node.id,name:S.node.name}),S.node.method&&t.openTab({key:p[0].toString(),params:{proto:S.node.proto,method:S.node.method},type:ye.Proto})},mn=function(){var U=Y()(f()().mark(function p(){var S;return f()().wrap(function(j){for(;;)switch(j.prev=j.next){case 0:return j.next=2,s.importProto();case 2:S=j.sent,S.success||me.Z.open({message:"Error while importing protos",description:S.message,icon:(0,r.jsx)(Se.Z,{style:{color:"red"}})});case 4:case"end":return j.stop()}},p)}));return function(){return U.apply(this,arguments)}}(),gn=function(){var U=Y()(f()().mark(function p(){var S;return f()().wrap(function(j){for(;;)switch(j.prev=j.next){case 0:return j.next=2,s.reloadProto();case 2:if(S=j.sent,S.success){j.next=6;break}return me.Z.open({message:"Error while reload protos",description:S.message,icon:(0,r.jsx)(Se.Z,{style:{color:"red"}})}),j.abrupt("return");case 6:Ce.ZP.success("Reload protos successful.");case 7:case"end":return j.stop()}},p)}));return function(){return U.apply(this,arguments)}}(),pn=function(){var U=Y()(f()().mark(function p(){return f()().wrap(function(x){for(;;)switch(x.prev=x.next){case 0:if(D!=null){x.next=3;break}return Ce.ZP.warn("Please select the deleted proto."),x.abrupt("return");case 3:Oe.Z.confirm({title:"Confirm delete proto",content:"Do you want to remove the proto configuration ".concat(D.name,"?"),onOk:function(){var z=wt(D.id),M=R()(z),V;try{for(M.s();!(V=M.n()).done;){var k=V.value,N=R()(t.openTabs),le;try{for(N.s();!(le=N.n()).done;){var K=le.value;if(K.key==k.id){t.remove(K.key);break}}}catch(q){N.e(q)}finally{N.f()}}}catch(q){M.e(q)}finally{M.f()}s.deleteProto(D.id),P(void 0)}});case 4:case"end":return x.stop()}},p)}));return function(){return U.apply(this,arguments)}}(),Qe=fn(s.protos);return(0,r.jsxs)(_.Z,{style:{height:"100%"},children:[(0,r.jsx)(_.Z.Header,{style:{padding:0,backgroundColor:"white",height:"44px",lineHeight:"44px",borderBottom:"1px solid #f0f0f0"},children:(0,r.jsxs)(Ee.Z,{children:[(0,r.jsx)(ee.Z,{flex:"auto",style:{paddingLeft:10,fontSize:18},children:"upRpc"}),(0,r.jsx)(ee.Z,{flex:"100px",children:(0,r.jsxs)(ge.Z,{size:8,style:{paddingRight:10},children:[(0,r.jsx)(Q.Z,{title:"Import protos",children:(0,r.jsx)("a",{className:A.operatorBtn,onClick:mn,children:(0,r.jsx)(We.Z,{})})}),(0,r.jsx)(Q.Z,{title:"Reload protos",children:(0,r.jsx)("a",{className:A.operatorBtn,onClick:gn,children:(0,r.jsx)(ot.Z,{})})}),(0,r.jsx)(Q.Z,{title:"Delete selectecd proto",children:(0,r.jsx)("a",{className:A.operatorBtn,onClick:pn,children:(0,r.jsx)(at.Z,{})})}),(0,r.jsx)(Q.Z,{title:"Import dependency paths",children:(0,r.jsx)("a",{className:A.operatorBtn,onClick:function(){return i.showIncludeDir(!i.includeDirDrawerVisible)},children:(0,r.jsx)(lt.Z,{})})}),(0,r.jsx)(Q.Z,{title:"Filter methods",children:(0,r.jsx)("a",{className:A.operatorBtn,onClick:function(){return $(!d)},children:(0,r.jsx)(ut.Z,{})})})]})})]})}),(0,r.jsxs)(_.Z.Content,{style:{backgroundColor:"white",overflow:"auto"},children:[(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(pe.Z,{size:"small",placeholder:"Filter Methods",hidden:!d,onChange:H,value:b,style:{marginBottom:5}}),Qe.length==0?(0,r.jsx)("div",{style:{height:"90%",display:"flex",justifyContent:"center",alignItems:"center"},children:(0,r.jsx)(je.Z,{description:"No proto"})}):(0,r.jsx)(nt.Z.DirectoryTree,{onExpand:L,fieldNames:{key:"id",title:"title",children:"children"},expandedKeys:C,autoExpandParent:ae,onSelect:vn,switcherIcon:(0,r.jsx)(dt.Z,{}),defaultExpandedKeys:["0-0-0"],treeData:Qe})]}),(0,r.jsx)(Ft,{})]})]})},Rt=(0,ue.Pi)(Nt),ce=a(70524),se=a(21369),Tt=a(63922),ke=a(80284),At=a(99611),Ke=a(93045),Je=a(33859),zt=function(){var n=(0,I.useContext)(ie),t=n.protoStore,s=function(){var i=Y()(f()().mark(function o(){var u;return f()().wrap(function(h){for(;;)switch(h.prev=h.next){case 0:return h.next=2,t.importProto();case 2:u=h.sent,u.success||me.Z.open({message:"Error while importing protos",description:u.message,icon:(0,r.jsx)(Se.Z,{style:{color:"red"}})});case 4:case"end":return h.stop()}},o)}));return function(){return i.apply(this,arguments)}}();return(0,r.jsx)("div",{style:{height:"90%",width:"90%",display:"flex",justifyContent:"center",alignItems:"center"},children:(0,r.jsx)(Je.ZP,{icon:(0,r.jsx)(Ke.Z,{style:{fontSize:120}}),title:"Welcome to use upRpc",subTitle:"Swim in the ocean of knowledge and enjoy it.",extra:(0,r.jsx)(T.Z,{type:"primary",onClick:function(){return s()},icon:(0,r.jsx)(He.Z,{}),children:"Import Protos"})})})},Vt=(0,ue.Pi)(zt),$t=a(36027),Ht=a(28280),Kt=a(27496),Jt=a(74842),Gt=a(60219),he=a(1769),Ge=a(54907),Ye=function(e){var n=e.value,t=(0,I.useState)("1"),s=O()(t,2),i=s[0],o=s[1];return n==null?(0,r.jsx)(je.Z,{image:je.Z.PRESENTED_IMAGE_SIMPLE}):(0,r.jsx)(Ge.Z,{activeKey:i,accordion:!0,onChange:function(d){return o(d)},children:n==null?void 0:n.map(function(u,d){return u==null||u==""?!0:(0,r.jsx)(Ge.Z.Panel,{header:"stream-"+((n==null?void 0:n.length)-d),children:(0,r.jsx)("pre",{style:{padding:0},children:u})},d+1)})})},Ue=a(52300);function Yt(e,n){if(l.Text==n)return Ue.DS.encode(e);var t=new DataView(new ArrayBuffer(16));switch(n){case l.Int8:t.setInt8(0,e);break;case l.Int16LE:t.setInt16(0,e,!0);break;case l.Int16BE:t.setInt16(0,e,!1);break;case l.Int32LE:t.setInt32(0,e,!0);break;case l.Int32BE:t.setInt32(0,e,!1);break;case l.FloatLE:t.setFloat32(0,e,!0);break;case l.FloatBE:t.setFloat32(0,e,!1);break;case l.DoubleLE:t.setFloat64(0,e,!0);break;case l.DoubleBE:t.setFloat64(0,e,!1);break;case l.Uint8:t.setUint8(0,e);break;case l.Uint16LE:t.setUint16(0,e,!0);break;case l.Uint16BE:t.setUint16(0,e,!1);break;case l.Uint32LE:t.setUint32(0,e,!0);break;case l.Uint32BE:t.setUint32(0,e,!1);break;case l.BigInt64LE:t.setBigInt64(0,e,!0);break;case l.BigInt64BE:t.setBigInt64(0,e,!1);break;case l.BigUint64LE:t.setBigUint64(0,e,!0);break;case l.BigUint64BE:t.setBigInt64(0,e,!1);break}return Ue.DS.encode(e)}function Qt(e,n){try{if(e=Ue.DS.toUint8Array(e),l.Text==n){var t=new TextDecoder().decode(e);return t}var s=new DataView(e.buffer,e.byteOffset,e.byteLength);switch(n){case l.Int8:return s.getInt8(0).toString();case l.Int16LE:return s.getInt16(0,!0).toString();case l.Int16BE:return s.getInt16(0,!1).toString();case l.Int32LE:return s.getInt32(0,!0).toString();case l.Int32BE:return s.getInt32(0,!1).toString();case l.FloatLE:return s.getFloat32(0,!0).toString();case l.FloatBE:return s.getFloat32(0,!1).toString();case l.DoubleLE:return s.getFloat64(0,!0).toString();case l.DoubleBE:return s.getFloat64(0,!1).toString();case l.Uint8:return s.getUint8(0).toString();case l.Uint16LE:return s.getUint16(0,!0).toString();case l.Uint16BE:return s.getUint16(0,!1).toString();case l.Uint32LE:return s.getUint32(0,!0).toString();case l.Uint32BE:return s.getUint32(0,!1).toString();case l.BigInt64LE:return s.getBigInt64(0,!0).toString().toString();case l.BigInt64BE:return s.getBigInt64(0,!1).toString();case l.BigUint64LE:return s.getBigUint64(0,!0).toString();case l.BigUint64BE:return s.getBigInt64(0,!1).toString();default:return"[Buffer ... "+e.length+" bytes]"}}catch{return"decode error"}}var Xt=function(e){var n=e.method,t=e.responseCache,s=e.onChange,i=function(C,E,c){if(console.log(" response mds: ",n.responseMds),n.responseMds==null)n.responseMds=[];else for(var Z=0;Z<n.responseMds.length;Z++)n.responseMds[Z].id==C&&n.responseMds.splice(Z,1);n.responseMds.push({id:C,key:E,parseType:c}),s(y()({},n))},o=function(C){if(n.responseMds==null)return 0;var E=R()(n.responseMds),c;try{for(E.s();!(c=E.n()).done;){var Z=c.value;if(Z.id==C)return Z.parseType}}catch(b){E.e(b)}finally{E.f()}return 0},u=[{title:"KEY",dataIndex:"key",key:"name",width:"200px"},{title:"VALUE",dataIndex:"value",key:"value",render:function(C,E){return(0,r.jsx)(qt,{id:E.id,value:E.value,parseType:o(E.id),onChange:function(Z,b){return i(Z,E.key,b)}})}}],d=(0,r.jsx)(r.Fragment,{});(t==null?void 0:t.mds)!=null&&(d=(0,r.jsxs)(r.Fragment,{children:[" (",t.mds.length,")"]}));var h=n.mode==W.ServerStream||n.mode==W.BidirectionalStream?{key:"response",label:"Response Stream",children:(0,r.jsx)(Ye,{value:t==null?void 0:t.streams})}:{key:" response",label:"Response",children:(0,r.jsx)("pre",{children:t==null?void 0:t.body})};console.log("responseCache: ",t);var v=[h,{label:(0,r.jsxs)(r.Fragment,{children:["Metadata",d]}),key:"matadata",children:(0,r.jsx)(he.Z,{size:"small",bordered:!0,pagination:!1,columns:u,rowKey:"id",dataSource:t==null?void 0:t.mds})}];return(0,r.jsx)(ke.Z,{style:{height:"100%"},animated:!1,items:v})},qt=function(n){var t=n.id,s=n.value,i=n.parseType,o=n.onChange,u=[];return Ne.forEach(function(d,h){return u.push((0,r.jsx)(se.Z.Option,{value:h.toString(),children:d},h))}),(0,r.jsxs)(Ee.Z,{children:[(0,r.jsx)(ee.Z,{flex:"auto",style:{display:"flex",alignItems:"center"},children:Qt(s,i)}),(0,r.jsx)(ee.Z,{flex:"100px",children:(0,r.jsx)(se.Z,{defaultValue:i.toString(),bordered:!1,onChange:function(h){return o(t,Number.parseInt(h))},style:{width:140},children:u},"s1"+t)})]})},_t=a(19632),Pe=a.n(_t),en=a(81474),tn=a(74981),dr=a(90252),cr=a(82679),nn=a(16596),rn=a(3089),sn=function(e){var n=e.running,t=e.method,s=e.requestCache,i=e.onChange,o=e.onPush,u=(0,I.useState)(t.requestBody),d=O()(u,2),h=d[0],v=d[1],B=function(D){i&&i(y()(y()({},t),{},{requestBody:D})),v(D)},C=(0,I.useState)(t.requestMds==null?[]:t.requestMds),E=O()(C,2),c=E[0],Z=E[1],b=function(D){c[D.id]=D,Z(Pe()(c)),i&&i(y()(y()({},t),{},{requestMds:c}))},oe=function(){c.push({parseType:0,id:""+c.length,key:"",value:""}),Z(Pe()(c))},fe=function(D){c.splice(D,1),Z(Pe()(c)),i&&i(y()(y()({},t),{},{requestMds:c}))},G=(0,r.jsx)(r.Fragment,{});c!==null&&c.length>0&&(G=(0,r.jsxs)(r.Fragment,{children:[" (",c.length,")"]}));var ae=t.mode==W.ClientStream||t.mode==W.BidirectionalStream,X=n&&ae?(0,r.jsx)(T.Z,{size:"small",type:"primary",icon:(0,r.jsx)(nn.Z,{}),onClick:function(){return o(h)},children:"Push"}):"",ve=[{label:"Params",key:"params",children:(0,r.jsx)(tn.ZP,{style:{background:"#fff"},width:"100%",height:"100%",mode:"json",theme:"textmate",name:"inputs",fontSize:13,cursorStart:2,showPrintMargin:!1,showGutter:!0,onChange:B,defaultValue:t.requestBody,setOptions:{useWorker:!0,displayIndentGuides:!0},tabSize:2})},{label:(0,r.jsxs)(r.Fragment,{children:["Metadata",G]}),key:"metadata",children:(0,r.jsxs)(he.Z,{rowKey:"id",size:"small",bordered:!0,pagination:!1,dataSource:c,children:[(0,r.jsx)(he.Z.Column,{className:A.metadataColumn,dataIndex:"key",title:"KEY",width:"30%",render:function(D,P,$){return(0,r.jsx)(pe.Z,{defaultValue:P.key,onChange:function(m){return b(y()(y()({},P),{},{key:m.target.value}))}},"key"+P.id)}},"key"),(0,r.jsx)(he.Z.Column,{className:A.metadataColumn,dataIndex:"value",title:"VALUE",render:function(D,P,$){return(0,r.jsx)(on,{metadata:P,onChange:function(m){return b(y()(y()({},m),{},{key:P.key}))}})}},"value"),(0,r.jsx)(he.Z.Column,{className:A.metadataColumn,dataIndex:"action",align:"center",width:80,title:(0,r.jsx)(Q.Z,{title:"Add metadata",children:(0,r.jsx)(T.Z,{size:"small",type:"text",icon:(0,r.jsx)(We.Z,{}),onClick:oe})}),render:function(D,P,$){return(0,r.jsx)(Q.Z,{title:"Delete metadata",placement:"bottom",children:(0,r.jsx)(T.Z,{size:"small",type:"text",icon:(0,r.jsx)(rn.Z,{}),onClick:function(){return fe($)}})})}},"action")]})}];return(0,r.jsxs)(ce.oL,{children:[(0,r.jsx)(ke.Z,{style:{height:"100%"},animated:!1,items:ve,tabBarExtraContent:(0,r.jsx)("div",{style:{paddingRight:10},children:X})}),(0,r.jsx)(ce.oL.Pane,{visible:ae,className:A.requestStreamHeight,children:(0,r.jsx)(en.Z,{title:"Request Stream",size:"small",bordered:!1,style:{height:"100%",marginTop:"3px"},bodyStyle:{height:"calc(100% - 40px)",overflow:"auto",padding:0},children:(0,r.jsx)(Ye,{value:s==null?void 0:s.streams})})})]})},on=function(n){var t=n.metadata,s=n.onChange,i=(0,I.useState)(t),o=O()(i,2),u=o[0],d=o[1],h=function(C){d(C),s(C)},v=[];return Ne.forEach(function(B,C){return v.push((0,r.jsx)(se.Z.Option,{value:C.toString(),children:B},C))}),(0,r.jsxs)("div",{style:{display:"flex"},children:[(0,r.jsx)(pe.Z,{defaultValue:u.value,onChange:function(C){return h(y()(y()({},u),{},{value:C.target.value}))}},"v"+u.id),t.key.endsWith("-bin")?(0,r.jsx)(se.Z,{defaultValue:u.parseType.toString(),bordered:!1,onChange:function(C){return h(y()(y()({},u),{},{parseType:Number.parseInt(C)}))},style:{width:140},children:v},"s"+u.id):""]})},an=function(n){var t=n.proto,s=n.method,i=(0,I.useContext)(ie),o=i.protoStore,u=i.tabStore,d=(0,I.useState)(t.host),h=O()(d,2),v=h[0],B=h[1],C=(0,I.useState)(s),E=O()(C,2),c=E[0],Z=E[1],b=function(m){u.setDot(c.id),B(m)},oe=function(m){u.setDot(m.id),Z(y()(y()({},m),{},{requestBody:m.requestBody,requestMds:m.requestMds}))},fe=function(m){u.setDot(m.id),Z(y()(y()({},m),{},{responseMds:m.responseMds}))},G=function(){var m=[];return c.requestMds!=null&&c.requestMds.length>0&&(m=c.requestMds.map(function(H,w){return y()(y()({},H),{},{key:H.key,value:Yt(H.value,H.parseType)})})),{id:c.id,body:c.requestBody,mds:m,methodMode:c.mode,methodName:c.name,serviceFullyName:c.serviceFullyName,serviceName:c.serviceName,protoPath:t.path,host:v}},ae=function(){var L=Y()(f()().mark(function m(){return f()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:return w.next=2,o.push(G(),!0);case 2:case"end":return w.stop()}},m)}));return function(){return L.apply(this,arguments)}}(),X=function(){var L=Y()(f()().mark(function m(){return f()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:return w.prev=0,w.next=3,o.send(G());case 3:w.next=8;break;case 5:w.prev=5,w.t0=w.catch(0),me.Z.open({message:"Calling error",description:w.t0.message,icon:(0,r.jsx)(Se.Z,{style:{color:"red"}})});case 8:case"end":return w.stop()}},m,null,[[0,5]])}));return function(){return L.apply(this,arguments)}}(),ve=function(){var L=Y()(f()().mark(function m(){return f()().wrap(function(w){for(;;)switch(w.prev=w.next){case 0:return w.next=2,o.stopStream(c.id);case 2:case"end":return w.stop()}},m)}));return function(){return L.apply(this,arguments)}}(),F=function(){o.saveProto(t,v,c),u.setDot(c.id,!1)},D=o.requestCaches.get(c.id),P=o.responseCaches.get(c.id),$=o.runningCaches.get(c.id);return console.log("running: ",$),(0,r.jsxs)(_.Z,{style:{height:"100%",backgroundColor:"white",padding:"0px 10px"},children:[(0,r.jsx)(_.Z.Header,{className:A.header,style:{paddingBottom:10},children:(0,r.jsxs)(Ee.Z,{gutter:5,children:[(0,r.jsx)(ee.Z,{flex:"auto",style:{paddingTop:5},children:(0,r.jsx)(pe.Z,{addonBefore:(0,r.jsxs)(ge.Z,{style:{width:110},children:[(0,r.jsx)($t.Z,{}),Lt[c.mode]]}),defaultValue:v,onChange:function(m){return b(m.target.value)}})}),(0,r.jsx)(ee.Z,{flex:"160px",children:(0,r.jsxs)(ge.Z,{children:[$?(0,r.jsx)(T.Z,{type:"primary",icon:(0,r.jsx)(Ht.Z,{}),onClick:ve,children:"Stop"}):c.mode==W.Unary?(0,r.jsx)(T.Z,{type:"primary",icon:(0,r.jsx)(Kt.Z,{}),onClick:X,children:"Send"}):(0,r.jsx)(T.Z,{type:"primary",icon:(0,r.jsx)(Jt.Z,{}),onClick:X,children:"Start"}),(0,r.jsx)(T.Z,{icon:(0,r.jsx)(Gt.Z,{}),onClick:F,children:"Save"})]})})]})}),(0,r.jsx)(_.Z.Content,{children:(0,r.jsxs)(ce.oL,{vertical:!0,children:[(0,r.jsx)(sn,{running:$,method:c,requestCache:D,onChange:oe,onPush:ae}),(0,r.jsx)(Xt,{method:c,responseCache:P,onChange:fe})]})})]})},ln=(0,ue.Pi)(an),un=function(){var n=(0,I.useContext)(ie),t=n.tabStore,s=n.protoStore,i=function(h,v){typeof h=="string"&&(t.remove(h),s.removeCache(h))},o=(0,r.jsxs)(ge.Z,{size:0,style:{marginRight:10},children:[(0,r.jsx)(se.Z,{defaultValue:"1",style:{width:180},bordered:!1,children:(0,r.jsx)(se.Z.Option,{value:"1",children:"No Environment"})}),(0,r.jsx)(T.Z,{type:"text",icon:(0,r.jsx)(At.Z,{}),size:"large"})]});if(t.openTabs.length==0)return(0,r.jsx)(Vt,{});var u=t.openTabs.map(function(d){var h=(0,r.jsx)(r.Fragment,{}),v=d.title;return d.type==ye.Proto&&(v=d.params.method.name,h=(0,r.jsx)(ln,{proto:d.params.proto,method:d.params.method})),{label:(0,r.jsx)(Tt.Z,{dot:d.dot,offset:[5,8],children:v}),key:d.key,closeable:d.closable,children:h}});return(0,r.jsx)(ke.Z,{hideAdd:!0,type:"editable-card",onEdit:i,style:{height:"100%"},size:"small",items:u,onTabClick:function(h){return t.selectTab(h)},activeKey:t.selectedTab})},dn=(0,ue.Pi)(un),cn=function(){(0,I.useEffect)(function(){Le("about",function(){console.log("about message: ",!0),s(!0)})},[]);var e=(0,I.useState)(!1),n=O()(e,2),t=n[0],s=n[1],i=function(){s(!1)};return(0,r.jsx)(Oe.Z,{title:"About Uprpc",open:t,onCancel:i,footer:null,children:(0,r.jsx)(Je.ZP,{icon:(0,r.jsx)(Ke.Z,{style:{fontSize:50}}),title:"Uprpc",subTitle:(0,r.jsxs)("div",{children:["version 1.0.0",(0,r.jsx)("br",{}),"Copyright (c) 2022 upbos. All rights reserved."]})})})};function hn(){return(0,r.jsx)(ie.Provider,{value:{includeDirStore:Ae,tabStore:ze,protoStore:Ve},children:(0,r.jsxs)(Xe.ZP,{children:[(0,r.jsxs)(ce.oL,{defaultSizes:[75,220],children:[(0,r.jsx)(ce.oL.Pane,{minSize:320,maxSize:600,children:(0,r.jsx)(Rt,{})}),(0,r.jsx)(dn,{})]}),(0,r.jsx)(cn,{})]})})}}}]);
