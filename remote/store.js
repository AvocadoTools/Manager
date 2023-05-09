import Writeable from "../util/writeable.js";

export const store = {
  action: new Writeable( [] ),
  conversation: new Writeable( [] ), 
  document: new Writeable( [] ), 
  link: new Writeable( [] ),
  meeting: new Writeable( [] ),
  milestone: new Writeable( [] ),
  person: new Writeable( [] ),  
  priority: new Writeable( [] ),
  project: new Writeable( [] ),
  room: new Writeable( [] ),
  status: new Writeable( [] ),
  situation: new Writeable( [] ),
  tag: new Writeable( [] ),
  type: new Writeable( [] )
};
