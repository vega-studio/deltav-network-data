import ready from "document-ready";
import * as Lib from "../lib";
import { makeNetworkExample } from "./examples/make-network-example";
import { test } from "./examples/test";

async function start() {
  const container = document.getElementById("main");
  if (!container) return;
  console.warn(Lib);
  makeNetworkExample();
}

ready(start);
