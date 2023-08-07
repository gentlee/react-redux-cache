import { users } from "./mocks";
import { User } from "./types";
import { delay } from "./utils";

export const updateUser = async (user: Partial<User> & Pick<User, 'id'>) => {
  await delay(1000)

  return {
    entities: {
      users: {
        [user.id]: {
          ...users.find(x => x.id === user.id),  
          ...user
        }
      }
    }
  }
}
