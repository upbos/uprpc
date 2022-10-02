import styles from "../style.less";
import {Button, Col, Input, Layout, notification, Row, Space} from "antd";
import React, {useContext, useState} from "react";
import {Allotment} from "allotment";
import {
    ApiOutlined, CloseCircleOutlined,
    FilePptOutlined,
    PlayCircleOutlined,
    PoweroffOutlined,
    SaveOutlined,
    SendOutlined
} from "@ant-design/icons";
import {context} from "@/stores/context";
import {observer} from "mobx-react-lite";
import Response from "@/pages/components/Response";
import Request from "@/pages/components/Request";
import {Method, Mode, modeMap, Proto, Metadata,} from "@/types/types";
import {encode} from "@/utils/metadata";

interface EditorProp {
    proto: Proto,
    method: Method
}

const editor = ({proto, method: initMethod}: EditorProp) => {
    let {protoStore, tabStore} = useContext(context)

    const [host, setHost] = useState(proto.host);
    const [method, setMethod] = useState(initMethod);

    const onHostChange = (host: string) => {
        tabStore.setDot(method.id)
        setHost(host);
    }

    const onRequestChange = (method: Method) => {
        tabStore.setDot(method.id)
        setMethod({...method, requestBody: method.requestBody, requestMds: method.requestMds});
    }

    const onResponseChange = (method: Method) => {
        tabStore.setDot(method.id);
        setMethod({...method, responseMds: method.responseMds});
    }

    const getRequestData = () => {
        let requestMds: Metadata[] = [];
        if (method.requestMds != null && method.requestMds.length > 0) {
            requestMds = method.requestMds.map((md, index) => {
                return {...md, key: md.key, value: encode(md.value, md.parseType)}
            })
        }
        return {
            id: method.id,
            body: method.requestBody,
            mds: requestMds,
            methodMode: method.mode,
            methodName: method.name,
            serviceFullyName: method.serviceFullyName,
            serviceName: method.serviceName,
            protoPath: proto.path,
            host: host,
        };
    }
    const onPush = async () => {
        await protoStore.push(getRequestData());
    }

    const onSend = async () => {
        try {
            await protoStore.send(getRequestData())
        } catch (e: any) {
            notification.open({
                message: 'Calling error',
                description: e.message,
                icon: <CloseCircleOutlined style={{color: 'red'}}/>
            });
        }
    }

    const onStop = async () => {
        await protoStore.stopStream(method.id);
    }

    const onSave = () => {
        protoStore.saveProto(proto, host, method);
        tabStore.setDot(method.id, false)
    }

    let requestCache = protoStore.requestCaches.get(method.id);
    let responseCache = protoStore.responseCaches.get(method.id);
    // @ts-ignore
    let running: boolean = protoStore.runningCaches.get(method.id);
    console.log('running: ', running)
    return (
        <Layout style={{height: '100%', backgroundColor: 'white', padding: '0px 10px'}}>
            <Layout.Header className={styles.header} style={{paddingBottom: 10}}>
                <Row gutter={5}>
                    <Col flex="auto" style={{paddingTop: 5}}>
                        <Input addonBefore={<Space style={{width: 110}}><ApiOutlined/>{modeMap[method.mode]}</Space>}
                               defaultValue={host}
                               onChange={e => onHostChange(e.target.value)}/>
                    </Col>
                    <Col flex="160px">
                        <Space>
                            {running ?
                                <Button type='primary' icon={<PoweroffOutlined/>} onClick={onStop}>Stop</Button> :
                                (method.mode == Mode.Unary ?
                                    <Button type='primary' icon={<SendOutlined/>} onClick={onSend}>Send</Button>
                                    : <Button type='primary' icon={<PlayCircleOutlined/>}
                                              onClick={onSend}>Start</Button>)}
                            <Button icon={<SaveOutlined/>}
                                    onClick={onSave}>Save</Button>
                            {/*<Button icon={<FilePptOutlined/>}*/}
                            {/*        onClick={onSave}>View Proto</Button>*/}
                        </Space>
                    </Col>
                </Row>
            </Layout.Header>
            <Layout.Content>
                <Allotment vertical={true}>
                    <Request running={running}
                             method={method}
                             requestCache={requestCache}
                             onChange={onRequestChange}
                             onPush={onPush}/>
                    <Response method={method} responseCache={responseCache} onChange={onResponseChange}/>
                </Allotment>
            </Layout.Content>
        </Layout>
    )
}
export default observer(editor);