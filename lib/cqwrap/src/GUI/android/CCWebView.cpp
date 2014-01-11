#include "../CCWebView.h"
#include "../../util/MessageDelegate.h"

USING_NS_CC_EXT;

DECLARE_SINGLETON_MEMBER(CCWebView);

bool CCWebView::open(const char* url){
	MessageDelegate::sharedMessageDelegate()->postMessage("HTTP_OPEN", url);
	return true;
}

void CCWebView::close(){
	MessageDelegate::sharedMessageDelegate()->postMessage("HTTP_CLOSE");
}

CCWebView::~CCWebView(){
	CCWebView::dropInstance();
}

