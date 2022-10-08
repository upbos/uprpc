import {ConfigProvider} from "antd";
import FileTree from "@/pages/components/File";
import {Allotment} from "allotment";
import "allotment/dist/style.css";
import React from "react";
import Tabs from "@/pages/components/Tabs";

import {includeDirStore, tabStore, protoStore, context} from '@/stores/context'
import About from "@/pages/components/About";

export default function HomePage() {
    return (
        <context.Provider value={{includeDirStore, tabStore, protoStore}}>
            <ConfigProvider>
                <Allotment defaultSizes={[75, 220]}>
                    <Allotment.Pane minSize={320} maxSize={600}>
                        <FileTree/>
                    </Allotment.Pane>
                    <Tabs/>
                </Allotment>
                <About/>
            </ConfigProvider>
        </context.Provider>
    );
}
