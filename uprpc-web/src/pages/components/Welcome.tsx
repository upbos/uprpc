import {CloseCircleOutlined, PlusOutlined, SmileOutlined} from "@ant-design/icons";
import {Button, notification, Result, Tabs} from "antd";
import {observer} from "mobx-react-lite";
import React, {useContext} from "react";
import {context} from "@/stores/context";

const welcome = () => {
    let {protoStore} = useContext(context);
    const onImport = async () => {
        const result = await protoStore.importProto()
        if (!result.success) {
            notification.open({
                message: 'Error while importing protos',
                description: result.message,
                icon: <CloseCircleOutlined style={{color: 'red'}}/>
            });
        }
    };

    return (<div style={{height: '90%', width:'90%', display: "flex", justifyContent: 'center', alignItems: 'center'}}>
        <Result
            icon={<SmileOutlined style={{fontSize: 120}}/>}
            title="Welcome to use upRpc"
            subTitle='Swim in the ocean of knowledge and enjoy it.'
            extra={<Button type="primary"
                           onClick={() => onImport()}
                           icon={<PlusOutlined/>}>Import Protos</Button>}/>
    </div>)
}

export default observer(welcome);