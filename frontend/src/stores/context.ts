import {createContext} from "react";
import IncludeDirStore from "@/stores/IncludeDir";
import TabStore from "@/stores/tab";
import ProtoStore from "@/stores/proto";

export const includeDirStore = new IncludeDirStore();
export const tabStore = new TabStore();
export const protoStore = new ProtoStore();

export const context = createContext({includeDirStore, tabStore, protoStore});