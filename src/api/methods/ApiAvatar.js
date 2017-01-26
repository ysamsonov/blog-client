import ApiMethodBase from "./ApiMethodBase";

/**
 * @author Yuriy Samsonov
 * @version 1.0
 * @date 26.01.2017
 */
export default class ApiAvatar extends ApiMethodBase {

    constructor(baseUrl) {
        super(baseUrl);
    }

    getMethodsGroup() {
        return 'avatars';
    }
}