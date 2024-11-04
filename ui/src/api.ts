import axios from "axios";
import { CoviScopeReq, CoviScopeRes } from "./defination";

export async function getCoviScopeData(
  req: CoviScopeReq
): Promise<CoviScopeRes> {
  const response = await axios.post("/chart", req);
  return response.data;
}
