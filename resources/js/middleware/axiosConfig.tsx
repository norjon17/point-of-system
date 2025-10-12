import axios from "axios";
import { CURRENTLINK } from "../constants/constants";

export const http = axios.create({
  withCredentials: true,
  baseURL: CURRENTLINK,
  withXSRFToken: true,
});
