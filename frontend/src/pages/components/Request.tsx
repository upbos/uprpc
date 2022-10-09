import React, {useState} from "react";
import {Button, Card, Input, Select, Table, Tabs, Tooltip} from "antd";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/ext-language_tools"
import {Allotment} from "allotment";
import Stream from "@/pages/components/Stream";
import {CloudUploadOutlined, MinusCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {Metadata, Method, Mode, parseTypeMap, RequestCache} from "@/types/types";
import styles from '../style.less';

interface requestProps {
    running: boolean,
    method: Method,
    requestCache?: RequestCache,
    onChange?: (method: Method) => void,
    onPush: (body: string) => void
}

export default ({running, method, requestCache, onChange, onPush}: requestProps) => {

    let [body, setBody] = useState(method.requestBody);
    const aceChange = (value: string) => {
        if (onChange) {
            onChange({...method, requestBody: value});
        }
        setBody(value);
    }

    const [mds, setMds] = useState(method.requestMds == null ? [] : method.requestMds);
    const onEdit = (metadata: Metadata) => {
        // @ts-ignore
        mds[metadata.id] = metadata;
        setMds([...mds])
        if (onChange) {
            onChange({...method, requestMds: mds});
        }
    }

    const onAdd = () => {
        mds.push({parseType: 0, id: "" + mds.length, key: '', value: ''});
        setMds([...mds]);
    }

    const onDelete = (index: number) => {
        mds.splice(index, 1);
        setMds([...mds]);
        if (onChange) {
            onChange({...method, requestMds: mds});
        }
    }

    let mdTitle = <></>;
    if (mds !== null && mds.length > 0) {
        mdTitle = <> ({mds.length})</>
    }
    let isStream = method.mode == Mode.ClientStream || method.mode == Mode.BidirectionalStream;
    let pushButton = running && isStream ?
        <Button size='small' type='primary' icon={<CloudUploadOutlined/>}
                onClick={() => onPush(body)}>Push</Button> : '';
    const items = [{
        label: 'Params', key: 'params', children:
            <AceEditor
                style={{background: "#fff"}}
                width={"100%"}
                height='100%'
                mode="json"
                theme="textmate"
                name="inputs"
                fontSize={13}
                cursorStart={2}
                showPrintMargin={false}
                showGutter
                onChange={aceChange}
                defaultValue={method.requestBody}
                setOptions={{
                    useWorker: true,
                    displayIndentGuides: true
                }}
                tabSize={2}
            />
    }, {
        label: <>Metadata{mdTitle}</>, key: 'metadata', children:
            <Table rowKey='id'
                   size={'small'}
                   bordered={true}
                   pagination={false}
                   dataSource={mds}>
                <Table.Column className={styles.metadataColumn} key='key' dataIndex='key' title='KEY' width={'30%'}
                              render={(text: string, record: any, index: number) => {
                                  return <Input key={'key' + record.id} defaultValue={record.key}
                                                onChange={(e) => onEdit({...record, key: e.target.value})}/>
                              }}/>
                <Table.Column className={styles.metadataColumn} key='value' dataIndex='value' title='VALUE'
                              render={(text: string, record: any, index: number) => {
                                  return <InputWrapper metadata={record}
                                                       onChange={metadata => onEdit({...metadata, key: record.key})}/>
                              }}/>
                <Table.Column className={styles.metadataColumn} key='action' dataIndex='action' align='center'
                              width={80}
                              title={<Tooltip title='Add metadata'>
                                  <Button size='small' type='text' icon={<PlusCircleOutlined/>} onClick={onAdd}/>
                              </Tooltip>}
                              render={(text: string, record: any, index: number) => {
                                  return <Tooltip title='Delete metadata' placement='bottom'>
                                      <Button size={"small"} type='text' icon={<MinusCircleOutlined/>}
                                              onClick={() => onDelete(index)}/>
                                  </Tooltip>
                              }}/>
            </Table>
    }];

    return (
        <Allotment>
            <Tabs style={{height: "100%"}} animated={false} items={items}
                  tabBarExtraContent={<div style={{paddingRight: 10}}>{pushButton}</div>}/>
            <Allotment.Pane visible={isStream} className={styles.requestStreamHeight}>
                <Card title='Request Stream' size={"small"} bordered={false} style={{height: '100%',marginTop: '3px'}}
                      bodyStyle={{height: 'calc(100% - 40px)', overflow: "auto", padding: 0}}>
                    <Stream value={requestCache?.streams}/>
                </Card>
            </Allotment.Pane>
        </Allotment>
    )
}


interface InputWrapperProp {
    metadata: Metadata,
    onChange: (metadata: Metadata) => void;
}

const InputWrapper = ({metadata, onChange}: InputWrapperProp) => {
    const [metadataState, setMetadataState] = useState(metadata);

    const handleChange = (md: Metadata) => {
        setMetadataState(md);
        onChange(md);
    }

    let items: any[] = [];
    parseTypeMap.forEach((value, key) => items.push(<Select.Option key={key}
                                                                   value={key.toString()}>{value}</Select.Option>))

    return <div style={{display: 'flex'}}>
        <Input key={'v' + metadataState.id} defaultValue={metadataState.value}
               onChange={e => handleChange({...metadataState, value: e.target.value})}/>
        {metadata.key.endsWith('-bin') ?
            <Select key={'s' + metadataState.id} defaultValue={metadataState.parseType.toString()} bordered={false}
                    onChange={value => handleChange({...metadataState, parseType: Number.parseInt(value)})}
                    style={{width: 140}}>
                {items}
            </Select> : ''}
    </div>
}