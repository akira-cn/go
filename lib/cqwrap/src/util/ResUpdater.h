//
//  ResUpdater.h
//  Chick1024
//
//  Created by akira_cn on 14-5-24.
//
//

#ifndef __CQWrap_ResUpdater_H__
#define __CQWrap_ResUpdater_H__

#include "cocos2d.h"
#include "cocos-ext.h"
#include "AssetsManager/AssetsManager.h"

NS_CC_EXT_BEGIN
USING_NS_CC_EXT;

class  ResUpdater: private cocos2d::CCObject, public cocos2d::extension::AssetsManagerDelegateProtocol{
protected:
    static ResUpdater* s_updater;
    static AssetsManager* s_manager;
    
    ResUpdater();

    void createDownloadedDir(const char* storagePath);
    std::string pathToSave;
public:
    static ResUpdater* getInstance();
    static void purgeResUpdater();

    AssetsManager* getAssetsManager(const char* packageUrl/* =NULL */, const char* versionFileUrl/* =NULL */, const char* storagePath/* =NULL */);
    
    virtual void onError(cocos2d::extension::AssetsManager::ErrorCode errorCode);
    virtual void onProgress(int percent);
    virtual void onSuccess();

    void reset();
    
};
NS_CC_EXT_END

#endif