import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Button, Drawer, List} from "antd";
import "allotment/dist/style.css";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons";
import {context} from '@/stores/context'

const includeDir = () => {
    let {includeDirStore} = useContext(context)
    return (
        <Drawer title='Import Paths' placement='left' width={500} open={includeDirStore.includeDirDrawerVisible}
                onClose={() => includeDirStore.showIncludeDir(false)} style={{padding: 5}}
                bodyStyle={{padding: 5}}
                extra={<Button type='link' icon={<PlusOutlined/>} onClick={() => includeDirStore.addIncludeDir()}>Add
                    Path</Button>}>
            <List
                size="large"
                loadMore={<div></div>}
                dataSource={includeDirStore.includeDirs}
                renderItem={item =>
                    <List.Item
                        actions={[<a onClick={() => includeDirStore.removeIncludeDir(item)}><CloseOutlined/></a>]}>
                        {item}
                    </List.Item>}
            />
        </Drawer>);
}

export default observer(includeDir)