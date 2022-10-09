import {Button, Modal, Result} from "antd";
import React, { useEffect, useState} from "react";
import {EventsOn} from "@/wailsjs/runtime";
import {PlusOutlined, SmileOutlined} from "@ant-design/icons";

export default () => {
    useEffect(function () {
        EventsOn('about', () => {
            console.log("about message: ", true);
            setIsModalOpen(true)
        })
    }, [])


    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (<Modal title="About Uprpc" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Result
            icon={<SmileOutlined style={{fontSize: 50}}/>}
            title="Uprpc"
            subTitle={<div>version 1.0.0<br/>Copyright (c) 2022 upbos. All rights reserved.</div>}/>

    </Modal>)
}
