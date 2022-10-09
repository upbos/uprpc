import React from "react";
import {Col, Row, Select, Table, Tabs} from "antd";
import Stream from "@/pages/components/Stream";
import {Method, Mode, parseTypeMap, ResponseCache} from "@/types/types";
import {decode} from "@/utils/metadata";

interface responseProps {
    method: Method,
    responseCache?: ResponseCache,
    onChange: (method: Method) => void
}

export default ({method, responseCache, onChange}: responseProps) => {
    const handleChange = (id: string, key: string, parseType: number) => {
        console.log(' response mds: ', method.responseMds)
        if (method.responseMds == null) {
            method.responseMds = [];
        } else {
            for (let i = 0; i < method.responseMds.length; i++) {
                if (method.responseMds[i].id == id) {
                    method.responseMds.splice(i, 1);
                }
            }
        }

        method.responseMds.push({id: id, key: key, parseType: parseType});
        onChange({...method});
    }

    const getParseType = (id: string) => {
        if (method.responseMds == undefined) return 0;
        for (let md of method.responseMds) {
            if (md.id == id) {
                return md.parseType;
            }
        }
        return 0;
    }

    const columns = [
        {title: 'KEY', dataIndex: 'key', key: 'name', width: '200px'},
        {
            title: 'VALUE', dataIndex: 'value', key: 'value', render: function (title: string, record: any) {
                return <BufferValue id={record.id} value={record.value} parseType={getParseType(record.id)}
                                        onChange={(id, parseType) => handleChange(id, record.key, parseType)}/>
            }
        }
    ];

    let mdTitle = <></>;
    if (responseCache?.mds != null) {
        mdTitle = <> ({responseCache.mds.length})</>
    }

    const tab = method.mode == Mode.ServerStream || method.mode == Mode.BidirectionalStream ?
        {key: 'response', label: 'Response Stream', children: <Stream value={responseCache?.streams}/>} : {
            key: ' response', label: 'Response',
            children: <pre>{responseCache?.body}</pre>
        }

    console.log("responseCache: ", responseCache)

    const tabItems = [tab, {
        label: <>Metadata{mdTitle}</>, key: 'matadata',
        children: <Table size='small' bordered={true} pagination={false} columns={columns} rowKey='id'
                         dataSource={responseCache?.mds}/>
    }];

    return <Tabs style={{height: "100%"}} animated={false} items={tabItems}/>;
}


interface BufferValueProp {
    id: string,
    value: any,
    parseType: number,
    onChange: (id: string, parseType: number) => void
}

const BufferValue = ({id, value, parseType, onChange}: BufferValueProp) => {
    let items: any[] = [];
    parseTypeMap.forEach((value, key) =>
        items.push(<Select.Option key={key} value={key.toString()}>{value}</Select.Option>))

    return <Row>
        <Col flex='auto' style={{display: 'flex', alignItems: 'center'}}>{decode(value, parseType)}</Col>
        <Col flex='100px'><Select key={'s1' + id} defaultValue={parseType.toString()} bordered={false}
                                  onChange={value => onChange(id, Number.parseInt(value))}
                                  style={{width: 140}}>
            {items}
        </Select></Col>
    </Row>
}


