import {Modal} from "antd";
import React, { useEffect, useState} from "react";
import {EventsOn} from "@/wailsjs/runtime";

export default () => {
    useEffect(function () {
        console.log('init about effect')
        EventsOn('about', () => {
            console.log("about message: ", true);
            setIsModalOpen(true)
        })
    }, [])


    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (<Modal title="About UpRpc" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <p>Icon</p>
        <p>UpRpc</p>
        <p>Version 1.0.0</p>
        <p>Copyright (c) 2022 UpUpc. All rights reserved.</p>
    </Modal>)
}
