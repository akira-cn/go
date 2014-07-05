//
//  ResUpdater.cpp
//  Chick1024
//
//  Created by akira_cn on 14-5-24.
//
//

#include "ResUpdater.h"

#include "cocos2d.h"
#include "cocos-ext.h"
#include "ScriptingCore.h"

#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
#include <dirent.h>
#include <sys/stat.h>
#endif

USING_NS_CC;
USING_NS_CC_EXT;
using namespace std;

ResUpdater* ResUpdater::s_updater = NULL;
AssetsManager* ResUpdater::s_manager = NULL;

ResUpdater::ResUpdater(){

}

ResUpdater* ResUpdater::getInstance(){
    if (NULL == ResUpdater::s_updater)
    {
        ResUpdater::s_updater = new ResUpdater();
    }

    return ResUpdater::s_updater;
}

void ResUpdater::purgeResUpdater(){
    if(NULL != ResUpdater::s_updater){
        CC_SAFE_DELETE(ResUpdater::s_updater);
    }
}

AssetsManager* ResUpdater::getAssetsManager(const char* packageUrl/* =NULL */, const char* versionFileUrl/* =NULL */, const char* storagePath/* =NULL */)
{   
    if (NULL == ResUpdater::s_manager){
        createDownloadedDir(storagePath);

        //CCLOG("%s", pathToSave.c_str());

        ResUpdater::s_manager = new AssetsManager(packageUrl,
                                           versionFileUrl,
                                           pathToSave.c_str());

        ResUpdater::s_manager->setDelegate(this);
        ResUpdater::s_manager->setConnectionTimeout(3);
    }
    return ResUpdater::s_manager;
}

void ResUpdater::onError(AssetsManager::ErrorCode errorCode)
{
    ScriptingCore::getInstance()->evalString("cc.onResourcesUpdateFail && cc.onResourcesUpdateFail()",NULL);
}

void ResUpdater::onProgress(int percent)
{
    char progress[20];
    //snprintf(progress, 20, "downloading %d%%", percent);
    ScriptingCore::getInstance()->evalString(
        CCString::createWithFormat("cc.onResourcesUpdating && cc.onResourcesUpdating('%d')", percent)
        ->getCString()
        ,NULL
    );    
}

void ResUpdater::onSuccess()
{
    //CCLOG("%s", pathToSave.c_str());
    //CCFileUtils::sharedFileUtils()->addSearchPath(pathToSave.c_str());
    
    vector<string> searchPaths = CCFileUtils::sharedFileUtils()->getSearchPaths();
    searchPaths.insert(searchPaths.begin(), pathToSave.c_str());
    CCFileUtils::sharedFileUtils()->setSearchPaths(searchPaths);

    ScriptingCore::getInstance()->evalString("cc.onResourcesUpdateSuccess && cc.onResourcesUpdateSuccess();",NULL);
}

void ResUpdater::createDownloadedDir(const char * storagePath)
{
    pathToSave = CCFileUtils::sharedFileUtils()->getWritablePath();
    pathToSave += storagePath;
    
    CCLOG("create %s", pathToSave.c_str());
    
    // Create the folder if it doesn't exist
#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
    DIR *pDir = NULL;
    pDir = opendir (pathToSave.c_str());
    if (! pDir){
        mkdir(pathToSave.c_str(), S_IRWXU | S_IRWXG | S_IRWXO);
    }
#else
    if ((GetFileAttributesA(pathToSave.c_str())) == INVALID_FILE_ATTRIBUTES){
        CreateDirectoryA(pathToSave.c_str(), 0);
    }
#endif
}

#ifndef KEY_OF_VERSION
#define KEY_OF_VERSION   "current-version-code"
#endif

void ResUpdater::reset()
{
    // Remove downloaded files
#if (CC_TARGET_PLATFORM != CC_PLATFORM_WIN32)
    string command = "rm -r ";
    // Path may include space.
    command += "\"" + pathToSave + "\"";
    system(command.c_str());
#else
    string command = "rd /s /q ";
    // Path may include space.
    command += "\"" + pathToSave + "\"";
    system(command.c_str());
#endif
    // Delete recorded version codes.
    CCUserDefault::sharedUserDefault()->setStringForKey(KEY_OF_VERSION, "");
    //if(NULL != ResUpdater::s_manager){
    //    ResUpdater::s_manager->deleteVersion();
    //}
}

