import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Badge, Button, Select, Space, Tabs} from "antd";
import "allotment/dist/style.css";
import {EyeOutlined} from "@ant-design/icons";
import {context} from '@/stores/context'
import {TabType} from "@/types/types";
import Welcome from "@/pages/components/Welcome";
import Editor from "@/pages/components/Editor";

const tabs = () => {
    let {tabStore, protoStore} = useContext(context)
    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (typeof targetKey === "string") {
            tabStore.remove(targetKey)
            protoStore.removeCache(targetKey)
        }
    };

    const extra = <Space size={0} style={{marginRight: 10}}>
        <Select defaultValue="1" style={{width: 180}} bordered={false}>
            <Select.Option value="1">No Environment</Select.Option>
        </Select>
        <Button type='text' icon={<EyeOutlined/>} size="large"/>
    </Space>;

    if (tabStore.openTabs.length == 0) {
        return <Welcome/>
    }

    const items = tabStore.openTabs.map((tab) => {
        let children = <></>;
        let label = tab.title;
        if (tab.type == TabType.Proto) {
            label = tab.params.method.name;
            children = <Editor proto={tab.params.proto} method={tab.params.method}/>
        }
        return {
            label: <Badge dot={tab.dot} offset={[5, 8]}>{label}</Badge>,
            key: tab.key,
            closeable: tab.closable,
            children: children
        };
    });

    return (
        <Tabs hideAdd type="editable-card" onEdit={onEdit} style={{height: "100%"}} size='small' items={items}
              onTabClick={(key: string) => tabStore.selectTab(key)}
              activeKey={tabStore.selectedTab}
              /*tabBarExtraContent={extra}*//>)
}

export default observer(tabs)