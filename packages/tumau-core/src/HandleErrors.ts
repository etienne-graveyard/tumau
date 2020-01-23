import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';
import { RequestConsumer } from './Contexts';

export const HandleErrors: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  try {
    return await tools.next();
  } catch (error) {
    if (isUpgrade) {
      return TumauUpgradeResponse.fromError(error);
    }
    // console.error(error);
    return TumauResponse.fromError(error);
  }
};
