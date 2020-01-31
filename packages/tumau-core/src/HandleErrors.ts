import { Middleware } from './Middleware';
import { TumauResponse } from './TumauResponse';
import { TumauUpgradeResponse } from './TumauUpgradeResponse';
import { RequestConsumer, DebugConsumer } from './Contexts';

export const HandleErrors: Middleware = async tools => {
  const isUpgrade = tools.readContextOrFail(RequestConsumer).isUpgrade;
  const debug = tools.readContext(DebugConsumer);
  try {
    return await tools.next();
  } catch (error) {
    if (isUpgrade) {
      return TumauUpgradeResponse.fromError(error);
    }
    // console.error(error);
    return TumauResponse.fromError(error, debug);
  }
};
